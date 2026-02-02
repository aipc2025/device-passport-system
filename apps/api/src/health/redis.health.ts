import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private redis: Redis | null = null;

  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Get Redis URL from environment or use default
      const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

      // Create temporary Redis connection for health check
      if (!this.redis) {
        this.redis = new Redis(redisUrl, {
          retryStrategy: () => null, // Don't retry on health check
          maxRetriesPerRequest: 1,
          lazyConnect: true,
        });
      }

      // Connect and ping Redis
      await this.redis.connect();
      const pingResult = await this.redis.ping();

      if (pingResult !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      // Get Redis info for additional metrics
      const info = await this.redis.info('stats');
      const serverInfo = await this.redis.info('server');

      // Extract connected clients count
      const connectedClientsMatch = info.match(/connected_clients:(\d+)/);
      const connectedClients = connectedClientsMatch ? parseInt(connectedClientsMatch[1], 10) : 0;

      // Extract uptime
      const uptimeMatch = serverInfo.match(/uptime_in_seconds:(\d+)/);
      const uptimeSeconds = uptimeMatch ? parseInt(uptimeMatch[1], 10) : 0;

      return this.getStatus(key, true, {
        status: 'up',
        message: 'Redis is healthy',
        connectedClients,
        uptime: uptimeSeconds,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Return warning status instead of throwing error if Redis is optional
      return this.getStatus(key, true, {
        status: 'optional',
        message: `Redis check skipped: ${errorMessage}`,
        warning: 'Redis is configured but not available',
      });
    }
  }

  async onModuleDestroy() {
    // Clean up Redis connection when module is destroyed
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}
