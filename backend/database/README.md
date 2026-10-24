# BloodConnect Database Architecture & Management

This directory documents the database layer, schema relationships, migrations, and automated disaster recovery procedures for the BloodConnect mission-critical healthcare platform.

## Architecture Overview

- **Core Module**: Located at [`src/database/`](../src/database/)
  - `client.ts`: Prisma Client with connection pooling, query logging, and lifecycle hooks (`connectDatabase`, `disconnectDatabase`).
  - `store.ts`: High-fidelity transactional store with relational constraints and seed entities.
  - `backup.ts`: Automated snapshot backup and disaster recovery utility (`createDatabaseBackup`, `restoreDatabaseBackup`, `listDatabaseBackups`).
  - `seed.ts`: System role bootstrap, admin initializers, and integrity validators.
  - `index.ts`: Master unified export interface.

- **Prisma Relational Schema**: Located at [`prisma/schema.prisma`](../prisma/schema.prisma)
  - 17 relational entities with cascade referential actions.
  - Indexing across all query hotpaths (`email`, `phone`, `status`, `bloodGroup`, `city`, `coordinates`).

- **Automated Backups**: Generated into [`database_backups/`](../database_backups/)
  - Snapshots with cryptographic checksums, record counts, and JSON format.

## Database Commands

```powershell
# Generate Prisma Client
npm run prisma:generate

# Apply pending database migrations
npm run prisma:migrate

# Create a manual database snapshot
npx tsx -e "import { createDatabaseBackup } from './src/database/index.js'; createDatabaseBackup();"
```
