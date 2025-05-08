import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsController } from './polls.controller';
import { PollsService } from './polls.service';
import { jwtModule, redisModule } from 'src/modules.config';
import { PollsRepository } from './polls.repository';
import { PollsGateway } from './polls.gateway';

@Module({
  imports: [ConfigModule, redisModule, jwtModule], // ConfigModule is imported to read environment variables provided by nestJs, redisModule is imported to use the Redis client.
  controllers: [PollsController],
  providers: [PollsService, PollsRepository, PollsGateway],
})
export class PollsModule {}
