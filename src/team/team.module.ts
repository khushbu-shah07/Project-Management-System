import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamUser } from './entities/team-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamUser])],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
