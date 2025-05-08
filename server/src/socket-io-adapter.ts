// Import necessary classes and interfaces from NestJS and Socket.IO
import { INestApplicationContext, Logger } from '@nestjs/common'; // INestApplicationContext for application context, Logger for logging
import { ConfigService } from '@nestjs/config'; // ConfigService to access configuration variables
import { IoAdapter } from '@nestjs/platform-socket.io'; // IoAdapter to create a Socket.IO adapter for NestJS
import { ServerOptions } from 'socket.io'; // ServerOptions for configuring the Socket.IO server

// Create a custom SocketIOAdapter class that extends the default IoAdapter
export class SocketIOAdapter extends IoAdapter {
  // Create a logger to log messages specific to this adapter
  private readonly logger = new Logger(SocketIOAdapter.name);

  // Constructor to initialize the adapter with the application context and configuration service
  constructor(
    private app: INestApplicationContext, // The application context
    private configService: ConfigService, // The configuration service to access environment variables
  ) {
    super(app); // Call the parent class constructor with the application context
  }

  // Method to create a Socket.IO server with custom options
  createIOServer(port: number, options?: ServerOptions) {
    // Get the client port from the configuration service
    const clientPort = parseInt(this.configService.get('CLIENT_PORT'));

    // Define CORS options to allow requests from specific origins
    const cors = {
      origin: [
        // Allow requests from the local client port
        `http://localhost:${clientPort}`,
        // Allow requests from a specific IP range with the client port
        new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
      ],
    };

    // Log the CORS configuration for debugging purposes
    this.logger.log('Configuring SocketIO server with custom CORS options', {
      cors,
    });

    // Combine the existing options with the new CORS options
    const optionsWithCORS: ServerOptions = {
      ...options, // Spread existing options
      cors, // Add the custom CORS options
    };

    // Return the created Socket.IO server, even though the method signature says it returns void
    return super.createIOServer(port, optionsWithCORS);
  }
}
