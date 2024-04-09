import { Module } from '@nestjs/common';
import { UserprojectService } from './userproject.service';
import { UserprojectController } from './userproject.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Userproject } from './entities/user-project.entity';
import { UsersModule } from 'src/users/users.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Userproject]),
    UsersModule,
    ProjectModule,
  ],
  controllers: [UserprojectController],
  providers: [UserprojectService],
  exports: [UserprojectService]
})
export class UserprojectModule {}
