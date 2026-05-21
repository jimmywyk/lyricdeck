import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { v4 as uuidv4 } from 'uuid';

let db: SqlJsDatabase | null = null;
let dbPath: string = '';

function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'lyricdeck.db');
}

function persistDb(): void {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
  }
}

export async function initDatabase(): Promise<void> {
  if (db) return;

  const SQL = await initSqlJs();
  dbPath = getDbPath();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  initSchema();
  persistDb();
}

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

function initSchema(): void {
  const database = db!;
  database.run(`
    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      data BLOB NOT NULL,
      source TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  database.run(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export function insertImage(
  file: Buffer,
  filename: string,
  mimeType: string,
  source: 'gallery' | 'song'
): string {
  const database = getDb();
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  database.run(
    'INSERT INTO images (id, filename, mime_type, data, source, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, filename, mimeType, new Uint8Array(file), source, createdAt]
  );
  persistDb();

  return `lyricdeck-img://${id}`;
}

export function getImage(id: string): { mime_type: string; data: Buffer } | null {
  const database = getDb();
  const stmt = database.prepare('SELECT mime_type, data FROM images WHERE id = ?');
  stmt.bind([id]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return {
      mime_type: row.mime_type as string,
      data: Buffer.from(row.data as Uint8Array),
    };
  }
  stmt.free();
  return null;
}

export function listGalleryImages(): string[] {
  const database = getDb();
  const results: string[] = [];
  const stmt = database.prepare('SELECT id FROM images WHERE source = ? ORDER BY created_at');
  stmt.bind(['gallery']);

  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push(`lyricdeck-img://${row.id}`);
  }
  stmt.free();
  return results;
}

export function deleteImage(id: string): boolean {
  const database = getDb();
  const countBefore = database.exec('SELECT COUNT(*) as c FROM images WHERE id = ?', [id]);
  const exists = countBefore.length > 0 && countBefore[0].values[0][0] as number > 0;

  if (exists) {
    database.run('DELETE FROM images WHERE id = ?', [id]);
    persistDb();
    return true;
  }
  return false;
}

export function getAllImagesForExport(): Array<{
  id: string;
  filename: string;
  mime_type: string;
  data: string;
  source: string;
}> {
  const database = getDb();
  const results: Array<{ id: string; filename: string; mime_type: string; data: string; source: string }> = [];
  const stmt = database.prepare('SELECT id, filename, mime_type, data, source FROM images');

  while (stmt.step()) {
    const row = stmt.getAsObject();
    results.push({
      id: row.id as string,
      filename: row.filename as string,
      mime_type: row.mime_type as string,
      data: Buffer.from(row.data as Uint8Array).toString('base64'),
      source: row.source as string,
    });
  }
  stmt.free();
  return results;
}

export function importImage(
  id: string,
  filename: string,
  mimeType: string,
  data: Buffer,
  source: string
): void {
  const database = getDb();
  // Check if already exists
  const existing = database.exec('SELECT id FROM images WHERE id = ?', [id]);
  if (existing.length > 0 && existing[0].values.length > 0) return;

  const createdAt = new Date().toISOString();
  database.run(
    'INSERT INTO images (id, filename, mime_type, data, source, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, filename, mimeType, new Uint8Array(data), source, createdAt]
  );
  persistDb();
}

export function getMeta(key: string): string | null {
  const database = getDb();
  const stmt = database.prepare('SELECT value FROM meta WHERE key = ?');
  stmt.bind([key]);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.value as string;
  }
  stmt.free();
  return null;
}

export function setMeta(key: string, value: string): void {
  const database = getDb();
  database.run(
    'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
    [key, value]
  );
  persistDb();
}

function getMimeType(ext: string): string {
  const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
  };
  return mimeMap[ext.toLowerCase()] || 'application/octet-stream';
}

export { getMimeType };
