import { TimeTrackingService } from './../time-tracking/time-tracking.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ProjectService } from 'src/project/project.service';
import { TaskService } from 'src/task/task.service';
import { UserprojectService } from 'src/userproject/userproject.service';

@Injectable()
export class ReportService {

  constructor(
    private readonly projectService: ProjectService,
    private readonly taskService: TaskService,
    private readonly userProjectService: UserprojectService,
    private readonly timeTrackingService:TimeTrackingService,
  ) { }

  create(createReportDto: CreateReportDto) {
    return 'This action adds a new report';
  }

  findAll() {
    return `This action returns all report`;
  }

  findOne(id: number) {
    return `This action returns a #${id} report`;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    return `This action updates a #${id} report`;
  }

  remove(id: number) {
    return `This action removes a #${id} report`;
  }

  async generateReport(id: number) {
    try {
      const project = await this.projectService.findOne(id);
      const tasks = await this.taskService.getAllProjectTasks(id);
      const users = await this.userProjectService.getUsersFromProject(id)
      const completedTasks = tasks.filter((task) => task.status === 'completed');
      const task_length = tasks.length;
      const completed_task_length = completedTasks.length

      const taskTimeLine=await this.timeTrackingService.getByProject(id);
      console.log(taskTimeLine);

      return {
        project: {
          title: project.name,
          manager: {
            name: project.pm_id.name,
            email: project.pm_id.email,
          },
          client: {
            email: project.clientEmail
          },
          timeline: {
            start_date: project.startDate,
            expected_end_date: project.expectedEndDate,
            actual_end_date: project.actualEndDate,
            work_done:{
              by_task:taskTimeLine.result,
              total_hours:taskTimeLine.total_hours,
            }
          },
          status: project.status,
          progress: JSON.stringify((completed_task_length / (task_length > 0 ? task_length : Infinity)) * 100) + "%"
        },
        tasks: {
          total_tasks: task_length,
          completed_tasks: completed_task_length,
          remaining_tasks: task_length - completed_task_length
        },
        employees: {
          total_employees: users.length
        }
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
