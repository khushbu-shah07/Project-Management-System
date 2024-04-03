import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserprojectDto } from './dto/create-userproject.dto';
import { UpdateUserprojectDto } from './dto/update-userproject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Userproject } from './entities/userproject.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserprojectService {
  constructor(
    @InjectRepository(Userproject)
    private readonly userProjectRepository: Repository<Userproject>,
  ) {}
  async create(createUserprojectDto: CreateUserprojectDto) {
    try {
      const userproject = this.userProjectRepository.create(
        createUserprojectDto as unknown as Userproject,
      );
      await this.userProjectRepository.save(userproject);
      return userproject;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all userproject`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userproject`;
  }

  update(id: number, updateUserprojectDto: UpdateUserprojectDto) {
    return `This action updates a #${id} userproject`;
  }

  remove(id: number) {
    return `This action removes a #${id} userproject`;
  }

  async getUsersFromProject(projectId: number) {
    try {
      const users = await this.userProjectRepository.find({
        where: { project_id: { id: projectId } },
        relations: ['user'],
      });
      return users;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async getProjectsFromUser(userId: number) {
    try {
      const projects = await this.userProjectRepository.find({
        where: { user_id: { id: userId } },
        relations: ['project'],
      });
      return projects;
    } catch (error) {
      throw new NotFoundException('error.message');
    }
  }

  async removeUserFromProject(userProjectData: CreateUserprojectDto) {
    try {
      const deleteUser = await this.userProjectRepository
        .createQueryBuilder('')
        .delete()
        .where('project_id = :projectId', {
          projectId: userProjectData.project_id,
        })
        .andWhere('user_id= :userId', { userId: userProjectData.user_id })
        .execute();
      if (deleteUser.affected === 0)
        throw new NotFoundException('User does not exists in this project');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
