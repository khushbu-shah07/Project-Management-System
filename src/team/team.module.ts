import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamUser } from './entities/team-user.entity';
import { UsersModule } from 'src/users/users.module';
import { UserprojectModule } from 'src/userproject/userproject.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamUser]), UserprojectModule, ProjectModule,UsersModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
