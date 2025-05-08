// Import Logger from NestJS to write log messages (display info in the terminal)
import { Logger } from '@nestjs/common';

// Import decorators and interfaces needed for creating a WebSocket gateway
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';

// Import the PollsService which has the logic for handling poll-related tasks
import { PollsService } from './polls.service';

// Define a WebSocket gateway that communicates with clients in real-time
@WebSocketGateway({
  // This sets the part of the server that listens specifically for 'polls' messages
  namespace: 'polls',
})

// Create a class called PollsGateway to handle WebSocket connections for polls
// We use OnGatewayInit to run code right after the gateway starts
export class PollsGateway implements OnGatewayInit {
  // Create a logger to show messages about what's happening inside this class
  private readonly logger = new Logger(PollsGateway.name);

  // The PollsService is made available here so we can use its methods inside this gateway
  constructor(private readonly pollsService: PollsService) {}

  // This method is automatically called by NestJS after the gateway is ready to use
  afterInit(): void {
    // Log to the terminal that the WebSocket gateway has started successfully
    this.logger.log(`Websocket Gateway initialized.`);
  }
}
