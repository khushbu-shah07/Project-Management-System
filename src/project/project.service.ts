import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { UsersService } from '../users/users.service';
import { ProjectStatus } from './entities/project.entity';
import { httpStatusCodes } from '../../utils/sendresponse';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly userService: UsersService,
  ) {}
  async create(projectData: CreateProjectDto): Promise<Project> {
    try {
      const user = await this.userService.findOne(projectData.pm_id);
      const projectData1 = { ...projectData, pm_id: user };
      const project = await this.projectRepository.create(
        projectData1 as unknown as Project,
      );
      await this.projectRepository.save(project);
      return project;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async findAll(): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find();
      return projects;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async findOne(id: number): Promise<Project> {
    try {
      const project = await this.projectRepository.findOne({
        where: {
          id: id,
        },
      });
      if (!project)
        throw new NotFoundException('Project with given id does not exists');
      return project;
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async update(id: number, projectData: UpdateProjectDto) {
    try {
      let startDate: Date;
      if (projectData.expectedEndDate) {
        const endDate = new Date(projectData.expectedEndDate);
        if (projectData.startDate) {
          startDate = new Date(projectData.startDate);
          if (endDate.getTime() < startDate.getTime()) {
            throw new BadRequestException('Invalid End Date');
          }
        } else {
          const temp = await this.findOne(id);
          startDate = new Date(temp.startDate);
          if (endDate.getTime() < startDate.getTime()) {
            throw new BadRequestException('Invalid End Date');
          }
        }
      }

      const project = await this.projectRepository.update(
        { id },
        projectData as unknown as Project,
      );

      if (project.affected === 0)
        throw new NotFoundException('Project with given id does not exists');
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async remove(id: number) {
    try {
      const data = await this.projectRepository.softDelete({ id });
      if (data.affected === 0)
        throw new NotFoundException('Project with given id does not exists');

      return { message: 'Project with given id deleted successfully!' };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async completeProject(id: number) {
    try {
      const statusUpdate = await this.projectRepository.update(id, {
        status: ProjectStatus.COMPLETED,
        actualEndDate: new Date().toISOString(),
      });

      if (statusUpdate.affected === 0)
        throw new NotFoundException('Project with given id does not exists');
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  async getAllProjectsByPmId(pm_id: number): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find({
        where: {
          pm_id: {
            id: pm_id
          }
        }
      })
      return projects;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
