// This file defines a custom RedisModule that can be added to your NestJS app.
// It lets you connect to Redis using your own custom settings — even from environment variables.

import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common'; //  These are NestJS core tools to build dynamic and async modules. DynamicModule is used when the module config is built at runtime. ModuleMetadata, FactoryProvider help define the config structure.
import { Module } from '@nestjs/common';
import IORedis, { Redis, RedisOptions } from 'ioredis'; //  Importing the Redis client library: ioredis (a very popular Redis client for Node.js).IORedis = the main class to create a Redis client. RedisOptions = options you pass to connect (like host and port).

// This is a token used by NestJS to identify and inject the Redis client later.
// Think of it as:
// "Whenever you see IORedisKey, give me the Redis client."
export const IORedisKey = 'IORedis';

// Interface for 'synchronous' Redis module configuration
type RedisModuleOptions = {
  connectionOptions: RedisOptions; // Connection config for Redis
  onClientReady?: (client: Redis) => void; // Optional callback after Redis is ready
};

// Interface for 'asynchronous' Redis module configuration
type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions; // Factory function to generate config
} & Pick<ModuleMetadata, 'imports'> & // Allow optional module imports
  Pick<FactoryProvider, 'inject'>; // Dependencies to inject into factory

@Module({}) // You declare a NestJS module (it's empty now, but will be built dynamically later).
export class RedisModule {
  // Static method to register the module asynchronously
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    // Calls your factory function to get connection settings. Gets the onClientReady callback if you provide it.
    const redisProvider = {
      provide: IORedisKey, // Injection token
      useFactory: async (...args) => {
        // Call the user-provided factory to get config
        const { connectionOptions, onClientReady } = await useFactory(...args);

        // Actually creates the Redis client with your settings.
        const client = await new IORedis(connectionOptions);

        // Call onClientReady callback if provided
        onClientReady(client);

        // Return the initialized client
        return client;
      },
      inject, // Inject dependencies into the factory
    };

    // Return the dynamic module definition
    return {
      module: RedisModule, // Current module
      imports, // Additional modules to import
      providers: [redisProvider], // Register the Redis provider
      exports: [redisProvider], // Export Redis provider for use in other modules
    };
  }
}
