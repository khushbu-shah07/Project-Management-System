import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, BadRequestException } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { TaskService } from 'src/task/task.service';
import { ProjectService } from 'src/project/project.service';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';

@UseGuards(AuthGuard)
@Controller('taskHours/')
export class TimeTrackingController {
  constructor(private readonly timeTrackingService: TimeTrackingService,private readonly taskService:TaskService,private readonly projectService:ProjectService) {}

  @Post()
  async create(@Body() createTimeTrackingDto: CreateTimeTrackingDto,@Req() req,@Res() res) {
    if(req.user.role!=='employee'){
      throw new BadRequestException("Access denied.");
    }

    try{
      const {task_id}=createTimeTrackingDto;
      const taskUser=await this.taskService.findTaskUserRow(task_id,req.user.id);
      // console.log(taskUser.id,req.user)
      if(!taskUser){
        throw new Error("Task is not assigned to you.");
      }

      const result=await this.timeTrackingService.create(taskUser.id,createTimeTrackingDto);
      
      sendResponse(res,httpStatusCodes.Created,'created','Add time log',result);
    }
    catch(err){
      throw new BadRequestException(err.message);
    }

  }

  @Get('/:taskId')
  async getByTask(@Param('taskId') task_id:number,@Req() req,@Res() res){
    try{
      if(req.user.role==='employee'){
        console.log(task_id,req.user.id)
        const hasTask=await this.taskService.findTaskUser(task_id,req.user.id);
        console.log(hasTask)
        if(!hasTask){
          throw new Error("Task is not assigned to you.");
        }
      }

      if(req.user.role==='pm'){
        const hasTask= await this.taskService.taskBelongsToPM(task_id,req.user.id);
        if(!hasTask){
          throw new Error("Task is not of your project.");
        }
      }

      const result=await this.timeTrackingService.getTaskHoursByTask(task_id);
      
      sendResponse(res,httpStatusCodes.OK,'ok','get hour logs by task',result);
    }
    catch(err){
      throw new BadRequestException(err.message);
    }
  }

  @Get()
  findAll() {
    return this.timeTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTimeTrackingDto: UpdateTimeTrackingDto) {
    return this.timeTrackingService.update(+id, updateTimeTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.timeTrackingService.remove(+id);
  }
}
