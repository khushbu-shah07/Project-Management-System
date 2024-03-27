import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [ TypeOrmModule.forRoot(dataSourceOptions),UsersModule, ProjectModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
