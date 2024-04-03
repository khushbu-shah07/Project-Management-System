import { Module } from '@nestjs/common';
import { UserprojectService } from './userproject.service';
import { UserprojectController } from './userproject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Userproject } from './entities/userproject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Userproject])],
  controllers: [UserprojectController],
  providers: [UserprojectService],
})
export class UserprojectModule {}
