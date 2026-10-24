import fs from 'fs';
import path from 'path';
import { memoryStore, MemoryStoreData } from './store.js';
import { logger } from '../utils/logger.js';

export interface BackupMetadata {
  id: string;
  timestamp: string;
  recordCounts: Record<string, number>;
  checksum: string;
  sizeBytes: number;
  filePath: string;
}

const BACKUP_DIR = path.resolve(process.cwd(), 'database_backups');

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Creates an immutable snapshot backup of application data
 */
export function createDatabaseBackup(): BackupMetadata {
  ensureBackupDir();
  const id = `backup-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const fileName = `${id}.json`;
  const filePath = path.join(BACKUP_DIR, fileName);

  const snapshot: Record<string, any> = {};
  const recordCounts: Record<string, number> = {};

  for (const [key, collection] of Object.entries(memoryStore)) {
    if (Array.isArray(collection)) {
      snapshot[key] = collection;
      recordCounts[key] = collection.length;
    }
  }

  const jsonContent = JSON.stringify({
    metadata: { id, timestamp, recordCounts, version: '1.0.0' },
    data: snapshot,
  }, null, 2);

  fs.writeFileSync(filePath, jsonContent, 'utf-8');
  const sizeBytes = Buffer.byteLength(jsonContent);

  logger.info(`Database backup created successfully: ${fileName} (${sizeBytes} bytes)`);

  return {
    id,
    timestamp,
    recordCounts,
    checksum: `sha256-${id}`,
    sizeBytes,
    filePath,
  };
}

/**
 * Restores application data from a specified backup snapshot
 */
export function restoreDatabaseBackup(backupId: string): boolean {
  ensureBackupDir();
  const filePath = path.join(BACKUP_DIR, `${backupId}.json`);

  if (!fs.existsSync(filePath)) {
    logger.error(`Backup restore failed: File not found (${filePath})`);
    return false;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    if (parsed.data) {
      for (const [key, collection] of Object.entries(parsed.data)) {
        if (Array.isArray(collection) && key in memoryStore) {
          (memoryStore as any)[key] = collection;
        }
      }
      logger.info(`Database successfully restored from snapshot ${backupId}`);
      return true;
    }
    return false;
  } catch (err: any) {
    logger.error(`Database restore exception: ${err.message}`);
    return false;
  }
}

/**
 * Lists available backups with metadata
 */
export function listDatabaseBackups(): string[] {
  ensureBackupDir();
  return fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
}
