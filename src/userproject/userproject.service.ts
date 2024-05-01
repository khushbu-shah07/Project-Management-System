import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserprojectDto } from './dto/create-userproject.dto';
import { UpdateUserprojectDto } from './dto/update-userproject.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Userproject } from './entities/user-project.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
import { httpStatusCodes } from 'utils/sendresponse';

@Injectable()
export class UserprojectService {
  constructor(
    @InjectRepository(Userproject)
    private readonly userProjectRepository: Repository<Userproject>,
  ) {}
  async create(createUserprojectDto: CreateUserprojectDto) {
    try {
      const { project_id, user_id } = createUserprojectDto;

      const existingUserProject = await this.userProjectRepository.findOne({
        where: { project_id, user_id } as FindOptionsWhere<Userproject>,
      });

      if (existingUserProject) {
        throw new ConflictException('User already exists in the project');
      }
      const userproject = this.userProjectRepository.create(
        createUserprojectDto as unknown as Userproject,
      );
      await this.userProjectRepository.save(userproject);
      return userproject;
    } catch (error) {
      if (error instanceof ConflictException) {
        const errorMessage = {
          message: error.message,
          statusCode: httpStatusCodes['Conflict'],
        };
        throw new ConflictException(errorMessage);
      }
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async getUsersFromProject(projectId: number) {
    try {
      const users = await this.userProjectRepository.find({
        where: { project_id: { id: projectId } },
        relations: ['user_id'],
      });
      if(users.length === 0) {
        throw new NotFoundException({
          message: 'Currently, no employees are assigned to this project',
          statusCode: httpStatusCodes['Not Found'],
        });
      }
      const mappedUsers = users.map((user) => ({
        id: user.id,
        user_detail: {
          user_id: user.user_id ? user.user_id.id : null,
          name: user.user_id ? user.user_id.name : null,

        },
      }));
      return mappedUsers;
    } catch (error) {
      if(error instanceof NotFoundException){
        const errorMessage = {
          message: error.message,
          statusCode: httpStatusCodes['Not Found'],
        };
        throw new NotFoundException(errorMessage)
      }
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async getProjectsFromUser(userId: number) {
    try {
      const projects = await this.userProjectRepository.find({
        where: { user_id: { id: userId } },
        relations: ['project_id'],
      });
      if(projects.length === 0){
        throw new NotFoundException('No project is assigned to you')
      }
      const mappedProjects = projects.map((project) => ({
        id: project.id,
        project_id: {
          id: project.project_id.id,
          name: project.project_id.name,
        },
      }));
      return mappedProjects;
    } catch (error) {
      if(error instanceof NotFoundException){
        const errorMessage = {
          message: error.message,
          statusCode: httpStatusCodes['Not Found'],
        };
        throw new NotFoundException(errorMessage)
      }
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
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
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }
}
