import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PollsModule } from './polls/pools.module';

@Module({
  imports: [ConfigModule.forRoot(), PollsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
