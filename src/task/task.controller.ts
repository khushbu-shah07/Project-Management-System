import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, Res, UseGuards, ForbiddenException, UseInterceptors, NotFoundException, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Request } from 'supertest';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Task, TaskPriority } from './entities/task.entity';
import { ProjectService } from 'src/project/project.service';
import { StartDateValidationPipe } from 'src/Pipes/startDatePipe';
import { EndDateValidationPipe } from 'src/Pipes/endDatePipe';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { CreateTaskUserDto } from './dto/create-task-user.dto';
import { UserprojectService } from 'src/userproject/userproject.service';
import { UsersService } from 'src/users/users.service';
import sendNotifyEmail from 'src/notification/Email/sendNotifyMail';
import { UserHasTask } from 'src/notification/serviceBasedEmail/userHasTask';
import { TaskStatus } from 'src/notification/serviceBasedEmail/TaskStatusUpdate';
import { ProjectManagerGuard } from 'src/auth/Guards/pm.guard';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userProjectService: UserprojectService,
    private readonly usersService:UsersService
  ) { }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post()
  @UseInterceptors(StartDateInterceptor, EndDateInterceptor)
  async create(@Body(StartDateValidationPipe,EndDateValidationPipe) createTaskDto: CreateTaskDto, @Req() req: Request, @Res() res: Response) {
    try {
      let task: Partial<Task>;
      if (req['user'].role === 'admin') {
        task = await this.taskService.create(createTaskDto)
      }

      else {
        const project = await this.projectService.findOne(createTaskDto.project_id);

        // Only the Project Manager of the project can add task
        if (project.pm_id['id'] === req['user'].id) {
          task = await this.taskService.create(createTaskDto)
        }
        else {
          throw new ForbiddenException("Access Denied")
        }
      }
      return sendResponse(res, httpStatusCodes.Created, "success", "Craete Task", task)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response, @Query('priority') priority: string) {
    try {
      let tasks: Task[]
      if (priority) {
        tasks = await this.taskService.getAllTaskByPriority(priority)
      } else {
        tasks = await this.taskService.findAll()
      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Get All Tasks", tasks)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard)
  @Get('/project/:id')
  async getProjectTasks(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
    @Query('priority') priority: string
  ) {
    try {
      const project = await this.projectService.findOne(+id);

      if (req['user'].role === "pm") {
        if (req['user'].id !== project.pm_id.id) {
          throw new ForbiddenException("Access Denied to fetch all project tasks")
        }
      }

      // If a user tries to fetch all tasks he/she must be already added in project
      if (req['user'].role === "employee") {
        const projectUser = await this.userProjectService.getUsersFromProject(+id);

        // check if user is associated with the project or not
        const userProject = projectUser.filter((pu) => pu.user_detail.user_id === req['user'].id);

        if (!userProject || userProject.length === 0) throw new ForbiddenException('You are not a part of this project')
      }

      let projectTasks = await this.taskService.getAllProjectTasks(+id);

      if (priority) projectTasks = projectTasks.filter((pt) => pt.priority === priority);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all project tasks',
        projectTasks
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === 'pm') {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Fetch Single Task")
        }
      }
      if (req['user'].role === 'employee') {
        const taskUser = await this.taskService.findTaskUser(+id, req['user'].id)
        if (!taskUser) {
          throw new ForbiddenException("Access Denied to Fetch Single Task")
        }
      }
      return sendResponse(res, httpStatusCodes.OK, "success", "Get Single Task", task)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body(StartDateValidationPipe) updateTaskDto: UpdateTaskDto, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Update Project")
        }
      }
      await this.taskService.update(+id, updateTaskDto)
      return sendResponse(res, httpStatusCodes.OK, "success", "Update Task", null)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post('/users')
  async assignTaskToUser(
    @Body() taskUserData: CreateTaskUserDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const task = await this.taskService.findOne(taskUserData.task_id);
      if (!task) throw new Error('Task with given id does not exists');

      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to assign task to user")
        }
      }
      const projectUser = await this.userProjectService.getUsersFromProject(task.project_id.id);

      const taskUser = await this.taskService.assignTask(taskUserData, task);
       
      // check if user is associated with the project or not
      const userProject = projectUser.filter((pu) => pu.user_detail.user_id === taskUserData.user_id);
      
      if (!userProject || userProject.length === 0) throw new Error('The user you are trying to assgin this task is not associated with the project of this task.')
     
      const pmOrAdminId=req['user'].id;
      const taskTitle=task.title;
      const projectId=task.project_id.id;
      UserHasTask.assignedOrRemoveToTask(this.usersService,this.projectService,pmOrAdminId,'Add',taskUserData,taskTitle,projectId)
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Assign task to user',
        taskUser
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete('/users')
  async deleteTaskUser(
    @Body() taskUserData: CreateTaskUserDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const task = await this.taskService.findOne(taskUserData.task_id);
      if (!task) throw new Error('Task with given id does not exists');

      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to remove user from task")
        }
      }

      await this.taskService.removeTaskUser(taskUserData);
      
      const pmOrAdminId=req['user'].id;
      const taskTitle=task.title;
      const projectId=task.project_id.id;
      UserHasTask.assignedOrRemoveToTask(this.usersService,this.projectService,pmOrAdminId,'Remove',taskUserData,taskTitle,projectId)

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Delete task user',
        null
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Delete Project")
        }
      }
      const data = await this.taskService.remove(+id)
      return sendResponse(res, httpStatusCodes.OK, "success", "Delete Task", { deletedTask: data })
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard)
  @Patch("/complete/:id")
  async completeTask(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Change Status Project")
        }
      }
      if (req['user'].role === 'employee') {
        const taskUser = await this.taskService.findTaskUser(+id, req['user'].id)
        if (!taskUser) {
          throw new ForbiddenException("Access Denied to Change the Status")
        }
      }
      const statusChange = await this.taskService.completeTask(+id)
      return sendResponse(res, httpStatusCodes.OK, "success", "Complete Task", statusChange)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard)
  @Patch("/complete/:id")
  async completeTask(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const task = await this.taskService.findOne(+id)
    if (req['user'].role === "pm") {
      if (req['user'].id !== task.project_id.pm_id.id) {
        throw new ForbiddenException("Access Denied to Change Status Project")
      }
    }
    if (req['user'].role === 'employee') {
      const taskUser = await this.taskService.findTaskUser(+id, req['user'].id)
      if (!taskUser) {
        throw new ForbiddenException("Access Denied to Change the Status")
      }
    }
    const taskTitle =task.title;
    const pmDetail=await this.usersService.findOne(task.project_id.pm_id.id)
    const pmEmail=pmDetail.email;
    const statusChange = await this.taskService.completeTask(+id);
    TaskStatus.TaskStatusUpdate(pmEmail,id ,'completed',this.taskService,taskTitle,this.projectService)
    return sendResponse(res, httpStatusCodes.OK, "sucess", "Complete Task", statusChange)
  }


  @UseGuards(AuthGuard,AdminProjectGuard)
  @Patch("/users/:id")
  async getUsersInTask(@Param('id') id:string,@Req() req: Request, @Res() res: Response){
    const task = await this.taskService.findOne(+id);
    if(!task){
      throw new Error('Task with given id does not exists');
    }
     const userEmailsInTask=await this.taskService.getUsersInTask(Number(id));
    
     return sendResponse(res,httpStatusCodes.OK,'success','all users got',userEmailsInTask)
  }
}

