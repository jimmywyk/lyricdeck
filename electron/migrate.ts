import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { insertImage, getMeta, setMeta, getMimeType } from './db';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

export function runMigration(): void {
  // Check if migration already completed
  if (getMeta('migration_completed_at')) {
    return;
  }

  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  const backgroundsDir = path.join(dataDir, 'backgrounds');
  const imagesDir = path.join(dataDir, 'images');

  const pathToUrlMap: Map<string, string> = new Map();

  // Migrate gallery backgrounds
  if (fs.existsSync(backgroundsDir)) {
    const files = fs.readdirSync(backgroundsDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    for (const file of files) {
      try {
        const filePath = path.join(backgroundsDir, file);
        const data = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mimeType = getMimeType(ext);
        const url = insertImage(data, file, mimeType, 'gallery');
        pathToUrlMap.set(filePath, url);
      } catch {
        // Skip corrupt files
      }
    }
  }

  // Migrate per-song images
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return IMAGE_EXTENSIONS.includes(ext);
    });

    for (const file of files) {
      try {
        const filePath = path.join(imagesDir, file);
        const data = fs.readFileSync(filePath);
        const ext = path.extname(file).toLowerCase();
        const mimeType = getMimeType(ext);
        const url = insertImage(data, file, mimeType, 'song');
        pathToUrlMap.set(filePath, url);
      } catch {
        // Skip corrupt files
      }
    }
  }

  // Update song data references
  if (pathToUrlMap.size > 0) {
    const songsFilePath = path.join(dataDir, 'songs.json');
    if (fs.existsSync(songsFilePath)) {
      try {
        const songsData = fs.readFileSync(songsFilePath, 'utf-8');
        let songs = JSON.parse(songsData);
        let modified = false;

        for (const song of songs) {
          // Check presentation.background.value
          if (song.presentation?.background?.value && pathToUrlMap.has(song.presentation.background.value)) {
            song.presentation.background.value = pathToUrlMap.get(song.presentation.background.value);
            modified = true;
          }

          // Check sections[].backgroundOverride.value
          if (song.sections) {
            for (const section of song.sections) {
              if (section.backgroundOverride?.value && pathToUrlMap.has(section.backgroundOverride.value)) {
                section.backgroundOverride.value = pathToUrlMap.get(section.backgroundOverride.value);
                modified = true;
              }
            }
          }
        }

        if (modified) {
          fs.writeFileSync(songsFilePath, JSON.stringify(songs, null, 2), 'utf-8');
        }
      } catch {
        // If songs.json is corrupt, skip reference update
      }
    }

    // Update settings.json references
    const settingsFilePath = path.join(dataDir, 'settings.json');
    if (fs.existsSync(settingsFilePath)) {
      try {
        const settingsData = fs.readFileSync(settingsFilePath, 'utf-8');
        let settings = JSON.parse(settingsData);
        let modified = false;

        if (settings.defaultBackground?.value && pathToUrlMap.has(settings.defaultBackground.value)) {
          settings.defaultBackground.value = pathToUrlMap.get(settings.defaultBackground.value);
          modified = true;
        }
        if (settings.logoImage && pathToUrlMap.has(settings.logoImage)) {
          settings.logoImage = pathToUrlMap.get(settings.logoImage);
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2), 'utf-8');
        }
      } catch {
        // Skip if corrupt
      }
    }
  }

  // Mark migration as complete
  setMeta('migration_completed_at', new Date().toISOString());
}
