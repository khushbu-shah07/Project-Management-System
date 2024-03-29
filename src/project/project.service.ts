import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {

  constructor(@InjectRepository(Project) private readonly projectRepository: Repository<Project>) { }

  async create(projectData: CreateProjectDto) {
    try {
      const project = await this.projectRepository.create(projectData as unknown as Project)
      await this.projectRepository.save(project);
      return project;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const projects = await this.projectRepository.find();
      return projects;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    };
  }

  async findOne(id: number) {
    try {
      const project = await this.projectRepository.findOne({
        where: {
          id: id
        }
      })
      if (!project) throw new Error('Project with given id does not exists')
      return project;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, projectData: UpdateProjectDto) {
    try {
      const project = await this.projectRepository.update({ id }, projectData as unknown as Project);

      if (project.affected === 0) throw new Error('Project with given id does not exists')
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const data = await this.projectRepository.softDelete({ id })
      if (data.affected === 0) throw new Error('Project with given id does not exists');

      return { message: 'Project with given id deleted successfully!' }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
