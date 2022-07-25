import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContractService } from './contract.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, ContractService],
})
export class AppModule {}
