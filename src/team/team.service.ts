import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { TeamUser } from './entities/team-user.entity';
import { CreateTeamUserDto } from './dto/create-team-user.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamUser)
    private readonly teamUserRepository: Repository<TeamUser>,
  ) {}

  async create(createTeamDto: CreateTeamDto) {
    try {
      const team = this.teamRepository.create(createTeamDto as unknown as Team);
      await this.teamRepository.save(team);
      return team;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const teams = await this.teamRepository.find();
      return teams;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const team = await this.teamRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!team) throw new Error('Department with given id does not exists');
      return team;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, updateTeamDto: UpdateTeamDto) {
    try {
      const data = await this.teamRepository.update({ id }, updateTeamDto);
      if (data.affected === 0)
        throw new Error('Team with given Id does not exists');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const data = await this.teamRepository.softDelete({ id });
      if (data.affected === 0)
        throw new Error('Team with given Id does not exists');
      return { message: 'Team with given Id deleted' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findUserInTeam(team_id: number, user_id: number) {
    try {
      const teamUser = await this.teamUserRepository
        .createQueryBuilder('tu')
        .where('tu.team_id = :teamId', { teamId: team_id })
        .andWhere('tu.user_id= :userId', { userId: user_id })
        .getCount();
      return teamUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  async addUserToTeam(teamUserData: CreateTeamUserDto) {
    try {
      const isExists = await this.findUserInTeam(
        teamUserData.team_id,
        teamUserData.user_id,
      );
      if (isExists > 0) throw new Error('User already exists in the team');
      const teamUser = await this.teamUserRepository.create(
        teamUserData as unknown as TeamUser,
      );
      await this.teamUserRepository.save(teamUser);
      return teamUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAllTeamUsers(team_id: number) {
    try {
      const teamUsers = await this.teamUserRepository.find({
        where: {
          team_id: team_id,
        },
      });
      return teamUsers;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeUserFromTeam(teamUserData: CreateTeamUserDto) {
    try {
      const deletedUser = await this.teamUserRepository
        .createQueryBuilder('')
        .delete()
        .where('team_id = :teamId', { teamId: teamUserData.team_id })
        .andWhere('user_id= :userId', { userId: teamUserData.user_id })
        .execute();
      if (deletedUser.affected === 0)
        throw new Error('User does not exists in this team');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
