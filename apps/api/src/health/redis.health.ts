import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator implements OnModuleDestroy {
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Get Redis URL from environment or use default
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

      // Create temporary Redis connection for health check if not exists
      if (!this.redis) {
        this.redis = new Redis(redisUrl, {
          retryStrategy: () => null, // Don't retry on health check
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 2000,
        });
      }

      // Ping Redis with timeout
      const pingResult = await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis ping timeout')), 2000)
        ),
      ]) as string;

      if (pingResult !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      // Get basic info (with error handling)
      let connectedClients = 0;
      let uptimeSeconds = 0;

      try {
        const info = await this.redis.info('stats');
        const serverInfo = await this.redis.info('server');

        const connectedClientsMatch = info.match(/connected_clients:(\d+)/);
        connectedClients = connectedClientsMatch ? parseInt(connectedClientsMatch[1], 10) : 0;

        const uptimeMatch = serverInfo.match(/uptime_in_seconds:(\d+)/);
        uptimeSeconds = uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0;
      } catch (infoError) {
        // Info gathering failed but ping succeeded, still mark as healthy
      }

      return this.getStatus(key, true, {
        status: 'up',
        message: 'Redis is healthy',
        connectedClients,
        uptime: uptimeSeconds,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Return warning status instead of throwing error (Redis is optional)
      return this.getStatus(key, true, {
        status: 'optional',
        message: `Redis check skipped: ${errorMessage}`,
        warning: 'Redis is configured but not currently available',
      });
    }
  }

  async onModuleDestroy() {
    // Clean up Redis connection when module is destroyed
    if (this.redis) {
      try {
        await this.redis.quit();
      } catch (error) {
        // Ignore errors during cleanup
      }
      this.redis = null;
    }
  }
}
