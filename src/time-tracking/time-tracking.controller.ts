import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, BadRequestException, HttpException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';


@ApiTags('Task Logs')
@ApiBearerAuth()
@ApiUnauthorizedResponse({description:"Missing or invalid token."})
@UseGuards(AuthGuard)
@Controller('taskHours/')
export class TimeTrackingController {

  constructor(private readonly timeTrackingService: TimeTrackingService,private readonly taskService:TaskService,private readonly projectService:ProjectService) {}

  @Post()
  @ApiCreatedResponse({description:"Log added."})
  @ApiForbiddenResponse({description:"Only employee can add log on their tasks."})
  async create(@Body() createTimeTrackingDto: CreateTimeTrackingDto,@Req() req,@Res() res) {
    if(req.user.role!=='employee'){
      throw new BadRequestException("Access denied.");
    }

    try{
      const {task_id}=createTimeTrackingDto;
      
      const taskUser=await this.taskService.findTaskUserRow(task_id,req.user.id);
      if(!taskUser){
        throw new ForbiddenException("Task is not assigned to you.");
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
  @ApiOkResponse({description:"List of your logs."})
  @ApiForbiddenResponse({description:"Only employee can get logs of their task."})
  async getMyLogs(@Req() req,@Res() res){
    try{
      if(req.user.role!=='employee'){
        throw new ForbiddenException("Only employees has access.")
      }

      const result=await this.timeTrackingService.getLogsByEmp(+req.user.id);
      sendResponse(res,httpStatusCodes.OK,'ok','Get your logs',result)
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  @Get('/:taskId')
  @ApiOkResponse({description:"List of logs on a task."})
  @ApiForbiddenResponse({description:"Task is of others."})
  async getByTask(@Param('taskId') task_id:number,@Req() req,@Res() res){
    try{
      if(req.user.role==='employee'){
        console.log(task_id,req.user.id)
        const hasTask=await this.taskService.findTaskUser(task_id,req.user.id);
        console.log(hasTask)
        if(!hasTask){
          throw new ForbiddenException("Task is not assigned to you.");
        }
      }

      if(req.user.role==='pm'){
        const hasTask= await this.taskService.taskBelongsToPM(task_id,req.user.id);
        if(!hasTask){
          throw new ForbiddenException("Task is not of your project.");
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
  @ApiOkResponse({description:"List of logs of a project."})
  @ApiForbiddenResponse({description:"Project is of others."})
  async getLogsOfProject(@Param('project_id') project_id:number,@Req() req,@Res() res){
    console.log(req.user.id)
    try{
      const project=await this.projectService.findOne(project_id);
      console.log("P",project)
      if(!project){
        throw new NotFoundException("Invalid project id.")
      }
      if(project.pm_id.id!==req.user.id){
        throw new ForbiddenException("This project is not yours.")
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
  @ApiOkResponse({description:"List of all logs."})
  @ApiForbiddenResponse({description:"Only admin has access."})
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
  @ApiOkResponse({description:"Log updated."})
  @ApiForbiddenResponse({description:"Log is of others."})
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
        {updatedLog:updatedData},
      );
    } catch (err) {
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AdminProjectGuard)
  @Get('/taskHours/emp/:userId')
  @ApiOkResponse({description:"List of logs by a employee."})
  @ApiForbiddenResponse({description:"Forbidden"})
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
    } catch (err) {
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request'])
    }
  }

}
