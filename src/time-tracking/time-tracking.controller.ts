import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { TimeTrackingService } from './time-tracking.service';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { TaskService } from 'src/task/task.service';
import { ProjectService } from 'src/project/project.service';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { TaskStatus } from 'src/task/entities/task.entity';
import { ProjectManagerGuard } from 'src/auth/Guards/pm.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';


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
      if(!taskUser){
        throw new Error("Task is not assigned to you.");
      }
      
      const task=await this.taskService.findOne(task_id);
      if(task.status===TaskStatus.COMPLETED)
        throw new Error("Task is complemented so cannot add time log.")
      
      const result=await this.timeTrackingService.create(taskUser.id,createTimeTrackingDto);
      
      sendResponse(res,httpStatusCodes.Created,'created','Add time log',result);
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }

  }

  @Get('my')
  async getMyLogs(@Req() req,@Res() res){
    try{
      if(req.user.role!=='employee'){
        throw new Error("Only employees has access.")
      }

      const result=await this.timeTrackingService.getLogsByEmp(+req.user.id);
      sendResponse(res,httpStatusCodes.OK,'ok','Get your logs',result)
    }
    catch(err){
      throw new BadRequestException(err.message)
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
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(ProjectManagerGuard)
  @Get('/project/:project_id')
  async getLogsOfProject(@Param('project_id') project_id:number,@Req() req,@Res() res){
    console.log(req.user.id)
    try{
      const project=await this.projectService.findOne(project_id);
      console.log("P",project)
      if(!project){
        throw new Error("Invalid project id.")
      }
      if(project.pm_id.id!==req.user.id){
        throw new Error("This project is not yours.")
      }

      const result=await this.timeTrackingService.getByProject(project_id);
      
      sendResponse(res,httpStatusCodes.OK,'ok','Get logs of a project',result)
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AdminGuard)
  @Get()
  findAll(@Req() req,@Res() res) {
    try{
      const result = this.timeTrackingService.findAll();
      sendResponse(res,httpStatusCodes.OK,'ok','Get all time logs.',result);
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  @Patch('/taskHours/:id')
  async update(
    @Param('id') id: number,
    @Body() updateTimeTrackingDto: UpdateTimeTrackingDto,
    @Req() req: Request,
    @Res() res,
  ) {
    try {
      const updatedData = await this.timeTrackingService.update(
        id,
        req['user'].id,
        updateTimeTrackingDto,
      );
      console.log(updatedData);

      if (!updatedData) {
        throw new NotFoundException(
          `Time tracking entry with ID "${id}" not found`,
        );
      }
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Updated timetrack details',
        updatedData,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AdminProjectGuard)
  @Get('/taskHours/emp/:userId')
  async getUserTimeLogs(
    @Param('userId') userId: number,
    @Req() req: Request,
    @Res() res,
  ) {
    console.log(req['user'].role)
    try {
      const data = await this.timeTrackingService.findOne(userId,req['user'].id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get log hours of user',
        data,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}
