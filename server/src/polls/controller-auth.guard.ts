import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable() // Marks this class as available for dependency injection
export class ControllerAuthGuard implements CanActivate {
  // Creating a logger instance with the class name for easy debugging
  private readonly logger = new Logger(ControllerAuthGuard.name);

  // Injecting JwtService to verify JWT tokens
  constructor(private readonly jwtService: JwtService) {}

  // This method is called automatically to decide whether a request can proceed
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Getting the request object from the HTTP context
    const request = context.switchToHttp().getRequest();

    // Logging request body for debugging
    this.logger.debug(`Checking for auth token on request body`, request.body);

    // Extracting the accessToken from the request body
    const { accessToken } = request.body;

    try {
      // Verifying the JWT token. If invalid, it throws an error
      const payload = this.jwtService.verify(accessToken);

      // If verification is successful, attach useful user data to the request
      request.userID = payload.sub; // Unique user ID
      request.pollID = payload.pollID; // Poll ID related to the request
      request.name = payload.name; // User's name

      // Allow the request to proceed
      return true;
    } catch {
      // If token verification fails, deny access
      throw new ForbiddenException('Invalid authorization token');
    }
  }
}
