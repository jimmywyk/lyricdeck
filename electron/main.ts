import { app, BrowserWindow, ipcMain, screen, dialog, protocol, session } from 'electron';
import path from 'path';
import fs from 'fs';
import { initDatabase, insertImage, getImage, listGalleryImages, deleteImage, getAllImagesForExport, importImage, upsertImage, getMimeType, purgeAllImages } from './db';
import { runMigration } from './migrate';

let mainWindow: BrowserWindow | null = null;
let projectionWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

// Register custom protocol before app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'lyricdeck-img',
  privileges: { standard: true, secure: true, supportFetchAPI: true }
}]);

function getDataPath(): string {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function getSongsFilePath(): string {
  return path.join(getDataPath(), 'songs.json');
}

function getSettingsFilePath(): string {
  return path.join(getDataPath(), 'settings.json');
}

function getPreparationListFilePath(): string {
  return path.join(getDataPath(), 'preparation-list.json');
}

function loadSongs(): any[] {
  const filePath = getSongsFilePath();
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function saveSongs(songs: any[]): void {
  const filePath = getSongsFilePath();
  fs.writeFileSync(filePath, JSON.stringify(songs, null, 2), 'utf-8');
}

function loadSettings(): any {
  const filePath = getSettingsFilePath();
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return null;
}

function saveSettings(settings: any): void {
  const filePath = getSettingsFilePath();
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
}

function loadPreparationList(): string[] {
  const filePath = getPreparationListFilePath();
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

function savePreparationList(list: string[]): void {
  const filePath = getPreparationListFilePath();
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf-8');
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'LyricDeck',
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
    if (projectionWindow) {
      projectionWindow.close();
      projectionWindow = null;
    }
  });
}

function createProjectionWindow(displayId?: string): void {
  const displays = screen.getAllDisplays();
  let targetDisplay = displays.find((d) => d.id.toString() === displayId);

  if (!targetDisplay) {
    // Use secondary display if available, otherwise use primary
    const primaryDisplay = screen.getPrimaryDisplay();
    targetDisplay = displays.find((d) => d.id !== primaryDisplay.id) || primaryDisplay;
  }

  const { x, y, width, height } = targetDisplay.bounds;

  projectionWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    fullscreen: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    projectionWindow.loadURL('http://localhost:5173/#/projection');
  } else {
    projectionWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
      hash: '/projection',
    });
  }

  projectionWindow.on('closed', () => {
    projectionWindow = null;
    mainWindow?.webContents.send('projection-window-closed');
  });
}

// IPC Handlers
ipcMain.handle('get-displays', () => {
  const displays = screen.getAllDisplays();
  const primaryId = screen.getPrimaryDisplay().id;
  return displays.map((d) => ({
    id: d.id.toString(),
    label: `${d.bounds.width}x${d.bounds.height}${d.id === primaryId ? ' (Primary)' : ''}`,
    bounds: d.bounds,
    isPrimary: d.id === primaryId,
  }));
});

ipcMain.handle('open-projection', (_event, displayId?: string) => {
  if (projectionWindow) {
    projectionWindow.close();
  }
  createProjectionWindow(displayId);
  return true;
});

ipcMain.handle('close-projection', () => {
  if (projectionWindow) {
    projectionWindow.close();
    projectionWindow = null;
  }
  return true;
});

ipcMain.handle('is-projection-open', () => {
  return projectionWindow !== null && !projectionWindow.isDestroyed();
});

ipcMain.on('update-projection', (_event, state) => {
  if (projectionWindow && !projectionWindow.isDestroyed()) {
    projectionWindow.webContents.send('projection-state', state);
  }
});

// Data persistence handlers
ipcMain.handle('load-songs', () => {
  return loadSongs();
});

ipcMain.handle('save-songs', (_event, songs) => {
  saveSongs(songs);
  return true;
});

ipcMain.handle('load-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (_event, settings) => {
  saveSettings(settings);
  return true;
});

ipcMain.handle('load-preparation-list', () => {
  return loadPreparationList();
});

ipcMain.handle('save-preparation-list', (_event, list) => {
  savePreparationList(list);
  return true;
});

// Image handlers - now using SQLite BLOB storage
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const data = fs.readFileSync(filePath);
    const filename = path.basename(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = getMimeType(ext);
    return insertImage(data, filename, mimeType, 'song');
  }
  return null;
});

ipcMain.handle('add-background-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'] }],
  });
  if (!result.canceled && result.filePaths.length > 0) {
    const added: string[] = [];
    for (const filePath of result.filePaths) {
      const data = fs.readFileSync(filePath);
      const filename = path.basename(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mimeType = getMimeType(ext);
      const url = insertImage(data, filename, mimeType, 'gallery');
      added.push(url);
    }
    return added;
  }
  return [];
});

ipcMain.handle('list-background-images', () => {
  return listGalleryImages();
});

ipcMain.handle('delete-background-image', (_event, imageUrl: string) => {
  const id = imageUrl.replace('lyricdeck-img://', '').replace('/', '');
  return deleteImage(id);
});

// Import/Export handlers
ipcMain.handle('export-data', async () => {
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Export LyricDeck Data',
    defaultPath: `lyricdeck-export-${Date.now()}.lyricdeck`,
    filters: [{ name: 'LyricDeck Export', extensions: ['lyricdeck'] }],
  });
  if (result.canceled || !result.filePath) return false;

  const songs = loadSongs();
  const settings = loadSettings();
  const images = getAllImagesForExport();

  const exportData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    songs,
    settings,
    preparationList: loadPreparationList(),
    images,
  };

  fs.writeFileSync(result.filePath, JSON.stringify(exportData), 'utf-8');
  return true;
});

ipcMain.handle('import-data', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Import LyricDeck Data',
    properties: ['openFile'],
    filters: [{ name: 'LyricDeck Export', extensions: ['lyricdeck'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return { success: false };

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
    const importData = JSON.parse(raw);

    if (!importData.version || !importData.songs) {
      return { success: false, error: 'invalid_format' };
    }

    // Import songs (merge - add songs that don't exist by id)
    const existingSongs = loadSongs();
    const existingIds = new Set(existingSongs.map((s: any) => s.id));
    let importedCount = 0;
    for (const song of importData.songs) {
      if (!existingIds.has(song.id)) {
        existingSongs.push(song);
        importedCount++;
      }
    }
    saveSongs(existingSongs);

    // Import settings (overwrite if provided)
    if (importData.settings) {
      saveSettings(importData.settings);
    }

    // Import preparation list (overwrite if provided)
    if (importData.preparationList) {
      savePreparationList(importData.preparationList);
    }

    // Import images
    let bgCount = 0;
    if (importData.version >= 2 && importData.images) {
      // v2 format: array of image objects with IDs
      for (const img of importData.images) {
        const data = Buffer.from(img.data, 'base64');
        importImage(img.id, img.filename, img.mime_type, data, img.source);
        bgCount++;
      }
    } else if (importData.backgroundImages) {
      // v1 format: Record<filename, base64> (legacy)
      for (const [fileName, base64Data] of Object.entries(importData.backgroundImages)) {
        const data = Buffer.from(base64Data as string, 'base64');
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = getMimeType(ext);
        insertImage(data, fileName, mimeType, 'gallery');
        bgCount++;
      }
    }

    return { success: true, importedSongs: importedCount, importedBackgrounds: bgCount };
  } catch {
    return { success: false, error: 'parse_error' };
  }
});

ipcMain.handle('import-data-upsert', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Import LyricDeck Data (Update Existing)',
    properties: ['openFile'],
    filters: [{ name: 'LyricDeck Export', extensions: ['lyricdeck'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return { success: false };

  try {
    const raw = fs.readFileSync(result.filePaths[0], 'utf-8');
    const importData = JSON.parse(raw);

    if (!importData.version || !importData.songs) {
      return { success: false, error: 'invalid_format' };
    }

    // Upsert songs: replace existing by id, add new ones
    const existingSongs = loadSongs();
    const existingIds = new Map<string, number>();
    existingSongs.forEach((s: any, idx: number) => existingIds.set(s.id, idx));
    let addedCount = 0;
    let updatedCount = 0;
    for (const song of importData.songs) {
      const existingIdx = existingIds.get(song.id);
      if (existingIdx !== undefined) {
        existingSongs[existingIdx] = song;
        updatedCount++;
      } else {
        existingSongs.push(song);
        addedCount++;
      }
    }
    saveSongs(existingSongs);

    // Import settings (overwrite if provided)
    if (importData.settings) {
      saveSettings(importData.settings);
    }

    // Import preparation list (overwrite if provided)
    if (importData.preparationList) {
      savePreparationList(importData.preparationList);
    }

    // Upsert images: replace existing by id, add new ones
    let bgAdded = 0;
    let bgUpdated = 0;
    if (importData.version >= 2 && importData.images) {
      for (const img of importData.images) {
        const data = Buffer.from(img.data, 'base64');
        const result = upsertImage(img.id, img.filename, img.mime_type, data, img.source);
        if (result.isNew) bgAdded++;
        else bgUpdated++;
      }
    } else if (importData.backgroundImages) {
      // v1 format: always insert new (no ID to deduplicate)
      for (const [fileName, base64Data] of Object.entries(importData.backgroundImages)) {
        const data = Buffer.from(base64Data as string, 'base64');
        const ext = path.extname(fileName).toLowerCase();
        const mimeType = getMimeType(ext);
        insertImage(data, fileName, mimeType, 'gallery');
        bgAdded++;
      }
    }

    return { success: true, importedSongs: addedCount, updatedSongs: updatedCount, importedBackgrounds: bgAdded, updatedBackgrounds: bgUpdated };
  } catch {
    return { success: false, error: 'parse_error' };
  }
});

// Purge data handlers
ipcMain.handle('purge-all-data', () => {
  // Delete all data files
  const songsPath = getSongsFilePath();
  const settingsPath = getSettingsFilePath();
  const prepListPath = getPreparationListFilePath();

  if (fs.existsSync(songsPath)) fs.unlinkSync(songsPath);
  if (fs.existsSync(settingsPath)) fs.unlinkSync(settingsPath);
  if (fs.existsSync(prepListPath)) fs.unlinkSync(prepListPath);

  // Purge all images and meta from SQLite
  purgeAllImages();

  return true;
});

ipcMain.handle('purge-songs-only', () => {
  const songsPath = getSongsFilePath();
  if (fs.existsSync(songsPath)) fs.unlinkSync(songsPath);
  return true;
});

app.whenReady().then(async () => {
  // Initialize database and run migration
  await initDatabase();
  runMigration();

  // Grant camera permission for the app's own windows (needed by the Visualizer)
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media');
  });

  // Register protocol handler for serving images from SQLite
  protocol.handle('lyricdeck-img', (request) => {
    const id = request.url.replace('lyricdeck-img://', '').replace('/', '');
    const image = getImage(id);
    if (!image) {
      return new Response('Not found', { status: 404 });
    }
    return new Response(new Uint8Array(image.data), {
      headers: {
        'Content-Type': image.mime_type,
        'Cache-Control': 'max-age=31536000',
      },
    });
  });

  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
