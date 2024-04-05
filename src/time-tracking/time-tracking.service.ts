import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHour } from './entities/time-tracking.entity';
import { TaskUser } from 'src/task/entities/task-user.entity';
import { Task } from 'src/task/entities/task.entity';
import { InitialMigration1712118639729 } from 'db/migrations/1712118639729-initialMigration';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TaskHour)
    private readonly taskHourRepository: Repository<TaskHour>,
  ) {}

  create(createTimeTrackingDto: CreateTimeTrackingDto) {
    return 'This action adds a new timeTracking';
  }

  findAll() {
    return `This action returns all timeTracking`;
  }

  remove(id: number) {
    return `This action removes a #${id} timeTracking`;
  }

  async update(
    id: number,
    user_id: any,
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
}
