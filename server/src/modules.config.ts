// This file dynamically registers a Redis module in a NestJS application using environment-based configuration.

import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule: Provides access to environment variables defined in .env or config files. ConfigService: A service that reads those variables using .get('VAR_NAME').
import { RedisModule } from './redis.module'; // Imports custom or third-party RedisModule from a local file. This is the module that will be registered with configuration in this file.

// Telling NestJS: “I want to register the RedisModule, but I’ll give you the configuration dynamically.”
export const redisModule = RedisModule.registerAsync({
  imports: [ConfigModule], // Please include the ConfigModule so I can read the .env file.

  // You give a function (useFactory) that runs and builds the Redis configuration.
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
  inject: [ConfigService], // You’re asking NestJS to inject ConfigService into it so you can read things like REDIS_HOST.
});
