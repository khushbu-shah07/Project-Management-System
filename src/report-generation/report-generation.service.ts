import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReportGenerationDto } from './dto/create-report-generation.dto';
import { UpdateReportGenerationDto } from './dto/update-report-generation.dto';
import { ProjectService } from 'src/project/project.service';
import { TaskService } from 'src/task/task.service';

@Injectable()
export class ReportGenerationService {
  constructor(private readonly projectService:ProjectService,private readonly taskService:TaskService){}
  create(createReportGenerationDto: CreateReportGenerationDto) {
    return 'This action adds a new reportGeneration';
  }

  findAll() {
    return `This action returns all reportGeneration`;
  }

  async generateReport(id: number) {
    try {
      const project = await this.projectService.findOne(id)
      const tasks = await this.taskService.getAllProjectTasks(id)
      const completedTask = tasks.filter((tasks)=>{
        return tasks.status === "completed"
      })

      return {
        project_manager:project.name,
        client_details:project.clientEmail,
        startDate:project.startDate,
        projectStatus:project.status,
        totalNoTasks:tasks.length,
        completedTasks:completedTask.length,

      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  update(id: number, updateReportGenerationDto: UpdateReportGenerationDto) {
    return `This action updates a #${id} reportGeneration`;
  }

  remove(id: number) {
    return `This action removes a #${id} reportGeneration`;
  }
}
