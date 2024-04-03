import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskUserDto } from './dto/create-task-user.dto';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>) {

  }
  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = await this.taskRepository.create(createTaskDto as unknown as Task);
      await this.taskRepository.save(task);
      return task;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const tasks = await this.taskRepository.find({
        select: {
          project_id: {
            id: true,
            pm_id: {
              id: true,
            }
          }
        },
        relations: ['project_id', 'project_id.pm_id']
      })
      return tasks;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const task = await this.taskRepository.findOne({
        where: { id: id },
        select: {
          project_id: {
            id: true,
            pm_id: {
              id: true,
            }
          }
        },
        relations: ['project_id', 'project_id.pm_id']
      })
      if (!task) {
        throw new Error("No Task With Given Id")
      }
      return task;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.taskRepository.update(id, updateTaskDto);
      if (task.affected === 0) throw new Error('Task with given id does not exists');
      return task.affected
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const data = await this.taskRepository.softDelete(id);
      if (data.affected === 0) throw new Error('Task with given id does not exists');
      return data.affected
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findTaskUser(task_id: number, user_id: number) {
    try {
      const taskUser = await this.taskUserRepository
        .createQueryBuilder('tu')
        .where('tu.task_id = :taskId', { taskId: task_id })
        .andWhere('tu.user_id = :userId', { userId: user_id })
        .getCount()
      return taskUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async assignTask(taskUserData: CreateTaskUserDto) {
    try {
      const isExists = await this.findTaskUser(taskUserData.task_id, taskUserData.user_id);
      if (isExists > 0) throw new Error('The task is already assigned to this user')

      const taskUser = await this.taskUserRepository.create(taskUserData as unknown as TaskUser);
      await this.taskUserRepository.save(taskUser);
      return taskUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeTaskUser(taskUserData: CreateTaskUserDto) {
    try {
      const result = await this.taskUserRepository
        .createQueryBuilder('')
        .delete()
        .where('task_id = :taskId', { taskId: taskUserData.task_id })
        .andWhere('user_id = :userId', { userId: taskUserData.user_id })
        .execute()
      if (result.affected === 0) throw new Error('The task is not assigned to this user')
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
