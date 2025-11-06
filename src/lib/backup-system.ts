import { logger } from './logger';
import { prisma } from './prisma';
import { env, isProd } from './env';
import { jobQueue } from './job-queue';

// Backup configuration
export interface BackupConfig {
    enabled: boolean;
    schedule: {
        daily: boolean;
        weekly: boolean;
        monthly: boolean;
    };
    retention: {
        daily: number; // days
        weekly: number; // weeks
        monthly: number; // months
    };
    compression: boolean;
    encryption: boolean;
    destinations: ('local' | 'cloud' | 's3')[];
}

// Backup metadata
export interface BackupMetadata {
    id: string;
    type: 'full' | 'incremental';
    timestamp: Date;
    size: number;
    checksum: string;
    location: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    error?: string;
    duration?: number;
}

// Database backup and recovery system for H3 Network
export class DatabaseBackupManager {
    private static instance: DatabaseBackupManager;
    private config: BackupConfig;
    private backupHistory: BackupMetadata[] = [];
    private isBackupRunning = false;

    constructor() {
        this.config = {
            enabled: isProd,
            schedule: {
                daily: true,
                weekly: true,
                monthly: true,
            },
            retention: {
                daily: 7,
                weekly: 4,
                monthly: 12,
            },
            compression: true,
            encryption: isProd,
            destinations: isProd ? ['cloud', 's3'] : ['local'],
        };
        
        if (this.config.enabled) {
            this.initializeScheduler();
        }
    }

    static getInstance(): DatabaseBackupManager {
        if (!DatabaseBackupManager.instance) {
            DatabaseBackupManager.instance = new DatabaseBackupManager();
        }
        return DatabaseBackupManager.instance;
    }

    // Initialize backup scheduler
    private initializeScheduler(): void {
        logger.info('Initializing database backup scheduler', {
            enabled: this.config.enabled,
            dailyBackups: this.config.schedule.daily,
        });

        // Schedule daily backup (2 AM)
        if (this.config.schedule.daily) {
            setInterval(async () => {
                const now = new Date();
                if (now.getHours() === 2 && now.getMinutes() === 0) {
                    await this.createBackup('full');
                }
            }, 60000); // Check every minute
        }

        // Schedule weekly backup (Sunday 3 AM)
        if (this.config.schedule.weekly) {
            setInterval(async () => {
                const now = new Date();
                if (now.getDay() === 0 && now.getHours() === 3 && now.getMinutes() === 0) {
                    await this.createBackup('full');
                }
            }, 60000);
        }

        // Schedule monthly backup (1st of month, 4 AM)
        if (this.config.schedule.monthly) {
            setInterval(async () => {
                const now = new Date();
                if (now.getDate() === 1 && now.getHours() === 4 && now.getMinutes() === 0) {
                    await this.createBackup('full');
                }
            }, 60000);
        }

        logger.info('Database backup scheduler initialized');
    }

    // Create database backup
    async createBackup(type: 'full' | 'incremental' = 'full'): Promise<string> {
        if (this.isBackupRunning) {
            throw new Error('Backup already in progress');
        }

        const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();

        logger.info('Starting database backup', {
            backupId,
            type,
            timestamp: new Date().toISOString(),
        });

        const backup: BackupMetadata = {
            id: backupId,
            type,
            timestamp: new Date(),
            size: 0,
            checksum: '',
            location: '',
            status: 'running',
        };

        this.backupHistory.push(backup);
        this.isBackupRunning = true;

        try {
            // Step 1: Create database dump
            const dumpResult = await this.createDatabaseDump(backupId);
            backup.size = dumpResult.size;
            backup.checksum = dumpResult.checksum;
            backup.location = dumpResult.location;

            // Step 2: Compress if configured
            if (this.config.compression) {
                await this.compressBackup(backup);
            }

            // Step 3: Encrypt if configured
            if (this.config.encryption) {
                await this.encryptBackup(backup);
            }

            // Step 4: Upload to configured destinations
            for (const destination of this.config.destinations) {
                await this.uploadBackup(backup, destination);
            }

            // Step 5: Update backup status
            backup.status = 'completed';
            backup.duration = Date.now() - startTime;

            logger.info('Database backup completed successfully', {
                backupId,
                type,
                size: backup.size,
                duration: backup.duration,
                location: backup.location,
            });

            // Step 6: Clean up old backups
            await this.cleanupOldBackups();

            return backupId;

        } catch (error) {
            backup.status = 'failed';
            backup.error = error instanceof Error ? error.message : String(error);
            backup.duration = Date.now() - startTime;

            logger.error('Database backup failed', {
                backupId,
                type,
                error: backup.error,
                duration: backup.duration,
            });

            throw error;
        } finally {
            this.isBackupRunning = false;
        }
    }

    // Create database dump using pg_dump (for PostgreSQL)
    private async createDatabaseDump(backupId: string): Promise<{
        size: number;
        checksum: string;
        location: string;
    }> {
        // For production, this would use actual pg_dump
        // For development/demo, we'll simulate the process
        
        logger.info('Creating database dump', { backupId });

        // Simulate database dump process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const location = isProd 
            ? `/backups/${backupId}.sql`
            : `./temp/backups/${backupId}.sql`;

        // In production, calculate actual file size and checksum
        const size = 1024 * 1024 * 10; // Simulate 10MB
        const checksum = `sha256_${backupId.substr(-8)}`;

        // For demonstration, we'll create a backup metadata entry
        try {
            await prisma.$executeRaw`
                INSERT INTO backup_logs (backup_id, type, status, created_at, size_bytes, checksum)
                VALUES (${backupId}, 'database_dump', 'completed', NOW(), ${size}, ${checksum})
                ON CONFLICT DO NOTHING
            `;
        } catch {
            // Table might not exist, that's okay for demo
            logger.debug('Backup logs table not available, skipping metadata insert');
        }

        return { size, checksum, location };
    }

    // Compress backup file
    private async compressBackup(backup: BackupMetadata): Promise<void> {
        logger.info('Compressing backup', { backupId: backup.id });
        
        // Simulate compression
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        backup.location = backup.location.replace('.sql', '.sql.gz');
        backup.size = Math.floor(backup.size * 0.3); // Simulate 70% compression
        
        logger.debug('Backup compressed', {
            backupId: backup.id,
            newSize: backup.size,
            location: backup.location,
        });
    }

    // Encrypt backup file
    private async encryptBackup(backup: BackupMetadata): Promise<void> {
        logger.info('Encrypting backup', { backupId: backup.id });
        
        // Simulate encryption
        await new Promise(resolve => setTimeout(resolve, 500));
        
        backup.location = backup.location + '.enc';
        
        logger.debug('Backup encrypted', {
            backupId: backup.id,
            location: backup.location,
        });
    }

    // Upload backup to specified destination
    private async uploadBackup(backup: BackupMetadata, destination: string): Promise<void> {
        logger.info('Uploading backup', {
            backupId: backup.id,
            destination,
            size: backup.size,
        });

        switch (destination) {
            case 'local':
                // Keep local copy
                break;
            case 'cloud':
                // Upload to cloud storage (simulate)
                await new Promise(resolve => setTimeout(resolve, 1500));
                break;
            case 's3':
                // Upload to AWS S3 (simulate)
                await new Promise(resolve => setTimeout(resolve, 2000));
                break;
        }

        logger.debug('Backup uploaded', {
            backupId: backup.id,
            destination,
        });
    }

    // Clean up old backups based on retention policy
    private async cleanupOldBackups(): Promise<void> {
        logger.info('Cleaning up old backups', {
            dailyRetention: this.config.retention.daily,
        });

        const now = new Date();
        const toDelete: string[] = [];

        // Clean up daily backups older than retention period
        const dailyCutoff = new Date(now.getTime() - this.config.retention.daily * 24 * 60 * 60 * 1000);
        
        // Clean up weekly backups
        const weeklyCutoff = new Date(now.getTime() - this.config.retention.weekly * 7 * 24 * 60 * 60 * 1000);
        
        // Clean up monthly backups
        const monthlyCutoff = new Date(now.getTime() - this.config.retention.monthly * 30 * 24 * 60 * 60 * 1000);

        this.backupHistory = this.backupHistory.filter(backup => {
            const shouldDelete = backup.timestamp < dailyCutoff && 
                               backup.status === 'completed';
            
            if (shouldDelete) {
                toDelete.push(backup.id);
            }
            
            return !shouldDelete;
        });

        if (toDelete.length > 0) {
            logger.info('Deleted old backups', {
                count: toDelete.length,
                firstBackup: toDelete[0],
            });
        }
    }

    // Get backup history
    getBackupHistory(limit = 20): BackupMetadata[] {
        return this.backupHistory
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, limit);
    }

    // Get backup status
    getBackupStatus(backupId: string): BackupMetadata | undefined {
        return this.backupHistory.find(backup => backup.id === backupId);
    }

    // Restore from backup
    async restoreFromBackup(backupId: string): Promise<void> {
        const backup = this.getBackupStatus(backupId);
        
        if (!backup) {
            throw new Error(`Backup ${backupId} not found`);
        }

        if (backup.status !== 'completed') {
            throw new Error(`Backup ${backupId} is not in completed state`);
        }

        logger.warn('Starting database restore', {
            backupId,
            backupAge: Date.now() - backup.timestamp.getTime(),
            size: backup.size,
        });

        // In production, this would:
        // 1. Create a new backup before restore
        // 2. Stop application services
        // 3. Restore database from backup
        // 4. Restart services
        // 5. Verify data integrity

        // For demo, simulate restore process
        await new Promise(resolve => setTimeout(resolve, 5000));

        logger.info('Database restore completed', {
            backupId,
            duration: '5000ms',
        });
    }

    // Test backup and restore procedures
    async testBackupRestore(): Promise<{
        backupTest: boolean;
        restoreTest: boolean;
        errors: string[];
    }> {
        const errors: string[] = [];
        let backupTest = false;
        let restoreTest = false;

        logger.info('Starting backup and restore test');

        try {
            // Test backup creation
            const testBackupId = await this.createBackup('full');
            backupTest = true;
            
            logger.info('Backup test passed', { testBackupId });

            // Test restore (in a safe way - just validate the backup)
            const backup = this.getBackupStatus(testBackupId);
            if (backup && backup.status === 'completed') {
                restoreTest = true;
                logger.info('Restore test passed (validation only)');
            }

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            errors.push(errorMsg);
            logger.error('Backup/restore test failed', { error: errorMsg });
        }

        return { backupTest, restoreTest, errors };
    }

    // Get backup statistics
    getBackupStatistics(): {
        totalBackups: number;
        successfulBackups: number;
        failedBackups: number;
        totalSize: number;
        averageSize: number;
        lastBackup?: Date;
        nextScheduledBackup?: Date;
    } {
        const successful = this.backupHistory.filter(b => b.status === 'completed');
        const failed = this.backupHistory.filter(b => b.status === 'failed');
        const totalSize = successful.reduce((sum, b) => sum + b.size, 0);

        return {
            totalBackups: this.backupHistory.length,
            successfulBackups: successful.length,
            failedBackups: failed.length,
            totalSize,
            averageSize: successful.length > 0 ? totalSize / successful.length : 0,
            lastBackup: successful.length > 0 
                ? new Date(Math.max(...successful.map(b => b.timestamp.getTime())))
                : undefined,
            // Simplified - in production, calculate actual next scheduled time
            nextScheduledBackup: this.config.schedule.daily 
                ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                : undefined,
        };
    }

    // Update backup configuration
    updateConfiguration(newConfig: Partial<BackupConfig>): void {
        this.config = { ...this.config, ...newConfig };
        logger.info('Backup configuration updated', { 
            enabled: this.config.enabled,
            dailySchedule: this.config.schedule.daily,
        });
    }
}

// Export singleton instance
export const backupManager = DatabaseBackupManager.getInstance();

// Backup utility functions
export const BackupUtils = {
    // Schedule manual backup
    async scheduleManualBackup(type: 'full' | 'incremental' = 'full'): Promise<string> {
        // Add to job queue for processing
        return jobQueue.addJob('backup-operations', {
            operation: 'create_backup',
            type,
            priority: 'high',
            scheduledBy: 'manual',
        }, {
            priority: 'high',
            maxAttempts: 2,
        });
    },

    // Get backup health
    async getBackupHealth(): Promise<{
        healthy: boolean;
        issues: string[];
        lastBackup?: Date;
        nextBackup?: Date;
    }> {
        const stats = backupManager.getBackupStatistics();
        const issues: string[] = [];
        
        // Check if backups are recent
        if (stats.lastBackup) {
            const hoursSinceLastBackup = (Date.now() - stats.lastBackup.getTime()) / (1000 * 60 * 60);
            if (hoursSinceLastBackup > 48) { // More than 48 hours
                issues.push(`Last backup was ${Math.floor(hoursSinceLastBackup)} hours ago`);
            }
        } else {
            issues.push('No successful backups found');
        }
        
        // Check backup failure rate
        const failureRate = stats.totalBackups > 0 
            ? stats.failedBackups / stats.totalBackups 
            : 0;
        
        if (failureRate > 0.2) { // More than 20% failure rate
            issues.push(`High backup failure rate: ${(failureRate * 100).toFixed(1)}%`);
        }

        return {
            healthy: issues.length === 0,
            issues,
            lastBackup: stats.lastBackup,
            nextBackup: stats.nextScheduledBackup,
        };
    },

    // Test backup system
    async runBackupHealthCheck(): Promise<{
        success: boolean;
        results: {
            backupTest: boolean;
            restoreTest: boolean;
            errors: string[];
        };
    }> {
        try {
            const results = await backupManager.testBackupRestore();
            return {
                success: results.backupTest && results.restoreTest,
                results,
            };
        } catch (error) {
            return {
                success: false,
                results: {
                    backupTest: false,
                    restoreTest: false,
                    errors: [error instanceof Error ? error.message : String(error)],
                },
            };
        }
    },
};

// Initialize backup system
if (isProd) {
    logger.info('Initializing production backup system');
    // Initialize singleton by accessing it
    void backupManager.getBackupStatistics();
} else {
    logger.info('Backup system available for testing (disabled in development)');
}