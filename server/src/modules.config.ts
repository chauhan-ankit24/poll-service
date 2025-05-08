// This file dynamically registers a Redis module in a NestJS application using environment-based configuration.

import { Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule: Provides access to environment variables defined in .env or config files. ConfigService: A service that reads those variables using .get('VAR_NAME').
import { RedisModule } from './redis.module'; // Imports custom or third-party RedisModule from a local file. This is the module that will be registered with configuration in this file.
import { JwtModule } from '@nestjs/jwt'; // JWT module for handling JSON Web Tokens, used for authentication and authorization in the application.
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

// This file dynamically registers a JWT module in a NestJS application using environment-based configuration.
// Telling NestJS: “I want to register the JWT module, but I’ll give you the configuration dynamically.”
// This is used for handling JSON Web Tokens (JWT) in the application.
// It allows you to create and verify JWTs, which are commonly used for stateless authentication.
// The JWT module is configured to use a secret key and expiration time, both of which are pulled from environment variables using the ConfigService.
// The secret key is used to sign the JWTs, ensuring that they cannot be tampered with.

// The JWT module is registered asynchronously, meaning that it will wait for the configuration to be resolved before being used. This is done using the registerAsync method.
// The configuration is provided using a factory function, which is a function that returns the configuration.
// The factory function is marked as async, allowing it to perform asynchronous operations if needed.
// The useFactory function is where you define the configuration for the JWT module.
export const jwtModule = JwtModule.registerAsync({
  imports: [ConfigModule], // Importing ConfigModule to access environment variables
  useFactory: async (configService: ConfigService) => ({
    secret: configService.get<string>('JWT_SECRET'), // JWT secret key from environment variables
    signOptions: {
      expiresIn: parseInt(configService.get<string>('POLL_DURATION')), // The expiration time determines how long the JWT is valid before it needs to be refreshed or reissued.
    },
  }),
  inject: [ConfigService], // Injecting ConfigService to access environment variables
});
