import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskHour } from './entities/time-tracking.entity';
import { Repository } from 'typeorm';
import { httpStatusCodes } from 'utils/sendresponse';
import { TaskUser } from 'src/task/entities/task-user.entity';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TaskHour)
    private readonly taskHourRepository: Repository<TaskHour>,
  ) {}


  async create(
    taskUser_id: number,
    createTimeTrackingDto: CreateTimeTrackingDto,
  ) :Promise<TaskHour>{
    delete createTimeTrackingDto.task_id;

    try {
      const log = await this.taskHourRepository.create({
        taskUser_id,
        ...createTimeTrackingDto,
      });
      return this.taskHourRepository.save(log);
    } catch (err) {
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  async getTaskHoursByTask(task_id: number) : Promise<{result:TaskUser[],total_hours:number}> {
    try {
      // const result = await this.taskHourRepository.find({
      //   where:{taskUser_id:{
      //     task_id:{
      //       id:task_id
      //     }
      //   }} as unknown,
      //   relations:['taskUser_id','taskUser_id.task_id','taskUser_id.user_id'],
      //   select:{
      //     taskUser_id:{
      //       id:true,
      //       user_id:{
      //         id:true,
      //         name:true,
      //         email:true,
      //       },
      //       task_id:{
      //         id:false,
      //       }
      //     }
      //   }
      // } as unknown);

      const result = await this.taskHourRepository.createQueryBuilder('taskHour')
        .select('user1.user_id', 'userId')
        // .addSelect('user1.task_id', 'taskId')
        .addSelect('SUM(taskHour.hours)', 'hours')
        .leftJoin('taskHour.taskUser_id', 'user1')
        .where('user1.task_id = :task_id', { task_id:task_id })
        .groupBy('user1.user_id')
        .addGroupBy('user1.task_id')
        .getRawMany();

      const r2 = await this.taskHourRepository
        .createQueryBuilder('th')
        .select('SUM(th.hours)', 'hours')
        .getRawOne();

      return { result:result, total_hours: r2.hours };
    } catch (err) {
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  async update(
    id: number,
    user_id: number,
    updateTimeTrackingDto: UpdateTimeTrackingDto,
  ) {
    try {
      const taskuser = await this.taskHourRepository.exists({
        relations: [
          'taskUser_id',
          'taskUser_id.user_id',
          'taskUser_id.task_id',
        ],
        where: {
          id: id,
          taskUser_id: {
            user_id: {
              id: user_id,
            },
          },
        } as unknown,
      });

      if (!taskuser) {
        throw new NotFoundException(
          'Your are not allowed to update others timelogs',
        );
      } else {
        const update = await this.taskHourRepository.update(
          { id },
          updateTimeTrackingDto,
        );
        if (update.affected === 0)
          throw new BadRequestException('No record found for updating');
        return update;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // get total loghrs of all tasks of user from userId (can only be accessed by particular pm of that task)
  async findOne(userId: number, pm_id: number) {
    try {
      const queryBuilder =
        await this.taskHourRepository.createQueryBuilder('taskHour');

      const individualRecords = await queryBuilder
        .select('user1.user_id', 'userId')
        .addSelect('user1.task_id', 'taskId')
        .addSelect('SUM(taskHour.hours)', 'WorkingHours')
        .leftJoin('taskHour.taskUser_id', 'user1')
        .leftJoin('user1.task_id', 'task')
        .leftJoin('task.project_id', 'project')
        .where('user1.user_id = :userId', { userId })
        .andWhere('project.pm_id=:pm_id', { pm_id: pm_id })
        .groupBy('user1.user_id')
        .addGroupBy('user1.task_id')
        .getRawMany();

      const totalHours = individualRecords.reduce((acc, record) => {
        const hours = record.WorkingHours;
        return acc + +hours;
      }, 0);

      return { individualRecords, totalHours };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getByProject(project_id:number):Promise<{result:TaskUser[],total_hours:number}>{
    try{

      const result = await this.taskHourRepository.createQueryBuilder('taskHour')
        .select('user1.task_id', 'task_id')
        .addSelect('MAX(task.status)','status')
        .addSelect('SUM(taskHour.hours)', 'hours')
        .leftJoin('taskHour.taskUser_id', 'user1')
        .leftJoin('user1.task_id','task')
        .where('task.project_id = :project_id', { project_id:project_id })
        .groupBy('user1.task_id')
        .addGroupBy('user1.task_id')
        .getRawMany();

      
      const total_hours=result.reduce((acc,row)=>acc+(+row.hours),0);

      return {result,total_hours};
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  async getLogsByEmp(emp_id:number):Promise<TaskHour[]>{
    try{
      return await this.taskHourRepository.find({
        where:{
          taskUser_id:{
            user_id:{
              id:emp_id,
            }
          }
        } as unknown,
        relations:['taskUser_id','taskUser_id.user_id','taskUser_id.task_id'],
        select:{
          taskUser_id:{
            id:true,
            user_id:{
              id:false,
            },
            task_id:{
              id:true,
              title:true,
              description:true,
              status:true,
              priority:true,
              startDate:true,
              expectedEndDate:true,
              actualEndDate:true,
            }
          }
        }
      } as unknown)
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  async findAll():Promise<TaskHour[]>{
    try{
      return this.taskHourRepository.find({});
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

}
