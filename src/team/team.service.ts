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

@Injectable()
export class TeamService {
  find(arg0: number) {
    throw new Error('Method not implemented.');
  }
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
}
