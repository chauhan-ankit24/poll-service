import { DynamicModule, FactoryProvider, ModuleMetadata } from '@nestjs/common';
import { Module } from '@nestjs/common';
import IORedis, { Redis, RedisOptions } from 'ioredis';

// Token used for injecting the Redis client
export const IORedisKey = 'IORedis';

// Interface for synchronous Redis module configuration
type RedisModuleOptions = {
  connectionOptions: RedisOptions; // Connection config for Redis
  onClientReady?: (client: Redis) => void; // Optional callback after Redis is ready
};

// Interface for asynchronous Redis module configuration
type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions; // Factory function to generate config
} & Pick<ModuleMetadata, 'imports'> & // Allow optional module imports
  Pick<FactoryProvider, 'inject'>; // Dependencies to inject into factory

@Module({})
export class RedisModule {
  // Static method to register the module asynchronously
  static async registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    // Define the Redis provider using the provided factory
    const redisProvider = {
      provide: IORedisKey, // Injection token
      useFactory: async (...args) => {
        // Call the user-provided factory to get config
        const { connectionOptions, onClientReady } = await useFactory(...args);

        // Create the Redis client
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
