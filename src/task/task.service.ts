import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskPriority, TaskStatus } from './entities/task.entity';
import { TaskUser } from './entities/task-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskUserDto } from './dto/create-task-user.dto';
import { Project, ProjectStatus } from 'src/project/entities/project.entity';
import { httpStatusCodes } from 'utils/sendresponse';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUser) private readonly taskUserRepository: Repository<TaskUser>,
    @InjectRepository(Project) private readonly projectRepository: Repository<Project>) {

  }
  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = await this.taskRepository.create(createTaskDto as unknown as Task);
      await this.taskRepository.save(task);
      return task;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
        throw new NotFoundException("No Task With Given Id")
      }
      return task;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    try {
      let startDate:Date;
      if (updateTaskDto.expectedEndDate) {
        const endDate = new Date(updateTaskDto.expectedEndDate)
        if(updateTaskDto.startDate){
          startDate = new Date(updateTaskDto.startDate)
          if (endDate.getTime() < startDate.getTime()){
            throw new BadRequestException("Invalid End Date")
          }
        }
        else{
          const temp = await this.findOne(id)
          startDate = new Date(temp.startDate)
          if (endDate.getTime() < startDate.getTime()){
            throw new BadRequestException("Invalid End Date")
          }
        }  
      }
      const task = await this.taskRepository.update(id, updateTaskDto);
      if (task.affected === 0) throw new NotFoundException('Task with given id does not exists');
      return task.affected
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async remove(id: number) {
    try {
      const data = await this.taskRepository.softDelete(id);
      if (data.affected === 0) throw new NotFoundException('Task with given id does not exists');
      return data.affected
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findTaskUserRow(task_id:number,user_id:number){
    try{
      return await this.taskUserRepository
      .createQueryBuilder('tu')
      .where('tu.task_id = :taskId', { taskId: task_id })
      .andWhere('tu.user_id = :userId', { userId: user_id }).getOne();
    }
    catch(error){
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async assignTask(taskUserData: CreateTaskUserDto, task: Task) {
    try {
      const isExists = await this.findTaskUser(taskUserData.task_id, taskUserData.user_id);
      if (isExists > 0) throw new BadRequestException('The task is already assigned to this user')

      const taskUser = await this.taskUserRepository.create(taskUserData as unknown as TaskUser);
      await this.taskUserRepository.save(taskUser);

      // Update the task status when it is assigned
      await this.taskRepository.update(taskUserData.task_id, {
        status: TaskStatus.IN_PROGRESS
      })

      // Update the project status when task of that project is assigned
      const project_id = task.project_id;
      await this.projectRepository.update(project_id, {
        status: ProjectStatus.IN_PROGRESS
      })


      return taskUser;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
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
      if (result.affected === 0) throw new BadRequestException('The task is not assigned to this user')
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async completeTask(id: number) {
    try {
      const statusUpdate = await this.taskRepository.update({ id }, { status: TaskStatus.COMPLETED, actualEndDate: new Date().toISOString() })
      if (statusUpdate.affected === 0) throw new NotFoundException("Task with given id does not exists")
      return "Task Status Updated Successfully"
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async taskBelongsToPM(task_id:number,pm_id:number){
    try{
      return await this.taskRepository.exists({
        where:{id:task_id,project_id:{
          pm_id:{
            id:pm_id,
          }
        }},
        relations:['project_id','project_id.pm_id'],
      })
    }
    catch(error){
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async getAllProjectTasks(project_id: number) {
    try {
      let projectTasks: Task[] = await this.taskRepository.find({
        where: {
          project_id: { id: project_id }
        }
      })
      return projectTasks;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async completeTask(id: number) {
    try {
      const statusUpdate = await this.taskRepository.update({ id }, { status: TaskStatus.COMPLETED, actualEndDate: new Date().toISOString() })
      if (statusUpdate.affected === 0) throw new Error("Task not found")
      return "Task Status Updated Successfully"
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async getAllProjectTasks(project_id: number) {
    try {
      let projectTasks: Task[] = await this.taskRepository.find({
        where: {
          project_id: project_id as any
        }
      })
      return projectTasks;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getAllTaskByPriority(priority: string) {
    try {
      const tasks = await this.taskRepository.find({ where: { priority: priority as any } })
      return tasks
    } catch (error) {
      throw new BadRequestException(error.message)

    }
  }

  async getUsersInTask(taskId:number){
    try{
     const usersInTask=await this.taskUserRepository.find({where:{id:taskId}})
     const userEmailsInTask=usersInTask.map((user)=>user.user_id.email);
     return userEmailsInTask;
    }
    catch(error){
      throw new BadRequestException(error.message)
    }
  }
}

