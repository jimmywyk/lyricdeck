import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Display management
  getDisplays: () => ipcRenderer.invoke('get-displays'),
  openProjection: (displayId?: string) => ipcRenderer.invoke('open-projection', displayId),
  closeProjection: () => ipcRenderer.invoke('close-projection'),
  isProjectionOpen: () => ipcRenderer.invoke('is-projection-open'),

  // Projection updates
  updateProjection: (state: any) => ipcRenderer.send('update-projection', state),
  onProjectionState: (callback: (state: any) => void) => {
    const handler = (_event: any, state: any) => callback(state);
    ipcRenderer.on('projection-state', handler);
    return () => ipcRenderer.removeListener('projection-state', handler);
  },
  onProjectionWindowClosed: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('projection-window-closed', handler);
    return () => ipcRenderer.removeListener('projection-window-closed', handler);
  },

  // Data persistence
  loadSongs: () => ipcRenderer.invoke('load-songs'),
  saveSongs: (songs: any[]) => ipcRenderer.invoke('save-songs', songs),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  loadPreparationList: () => ipcRenderer.invoke('load-preparation-list'),
  savePreparationList: (list: string[]) => ipcRenderer.invoke('save-preparation-list', list),

  // File dialogs
  selectImage: () => ipcRenderer.invoke('select-image'),

  // Background image repository
  addBackgroundImage: () => ipcRenderer.invoke('add-background-image'),
  listBackgroundImages: () => ipcRenderer.invoke('list-background-images'),
  deleteBackgroundImage: (imagePath: string) => ipcRenderer.invoke('delete-background-image', imagePath),

  // Import / Export
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  importDataUpsert: () => ipcRenderer.invoke('import-data-upsert'),

  // Purge data
  purgeAllData: () => ipcRenderer.invoke('purge-all-data'),
  purgeSongsOnly: () => ipcRenderer.invoke('purge-songs-only'),
});
