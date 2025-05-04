import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis.module';

// Register the Redis module asynchronously with dynamic configuration
export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule], // Import ConfigModule to access environment variables
  useFactory: async (configService: ConfigService) => {
    const logger = new Logger('RedisModule'); // Logger instance for logging Redis events

    return {
      // Redis connection options pulled from environment variables
      connectionOptions: {
        host: configService.get('REDIS_HOST'), // e.g., 'localhost'
        port: configService.get('REDIS_PORT'), // e.g., 6379
      },
      // Callback once the Redis client is ready
      onClientReady: (client) => {
        logger.log('Redis client ready'); // Log when Redis is ready

        // Log any Redis errors
        client.on('error', (err) => {
          logger.error('Redis Client Error: ', err);
        });

        // Log successful connection event
        client.on('connect', () => {
          logger.log(
            `Connected to redis on ${client.options.host}:${client.options.port}`,
          );
        });
      },
    };
  },
  inject: [ConfigService], // Inject ConfigService into useFactory
});
