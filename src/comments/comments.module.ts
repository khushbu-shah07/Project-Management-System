import { TaskModule } from './../task/task.module';
import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { ProjectModule } from 'src/project/project.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[TaskModule,TypeOrmModule.forFeature([Comment]),ProjectModule,UsersModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
