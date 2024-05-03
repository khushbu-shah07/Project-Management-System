import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, Res, UseGuards, ForbiddenException, UseInterceptors, NotFoundException, Query, UsePipes, HttpException, ConflictException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Request } from 'express';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Task, TaskPriority } from './entities/task.entity';
import { ProjectService } from '../project/project.service'
import { StartDateValidationPipe } from 'src/Pipes/startDatePipe';
import { EndDateValidationPipe } from 'src/Pipes/endDatePipe';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { CreateTaskUserDto } from './dto/create-task-user.dto';
import { UserprojectService } from '../userproject/userproject.service'
import { UsersService } from '../users/users.service'
import { UserHasTask } from 'src/notification/serviceBasedEmail/userHasTask';
import { TaskStatus } from 'src/notification/serviceBasedEmail/TaskStatusUpdate';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService,
    private readonly projectService: ProjectService,
    private readonly userProjectService: UserprojectService,
    private readonly usersService: UsersService
  ) { }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post()
  @UsePipes(StartDateValidationPipe, EndDateValidationPipe)
  @ApiOperation({ summary: 'Create Task' })
  @ApiCreatedResponse({ status: 201, description: 'Task Created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiBody({
    description: 'Task details',
    type: CreateTaskDto,
  })
  async create(@Body(StartDateValidationPipe, EndDateValidationPipe) createTaskDto: CreateTaskDto, @Req() req: Request, @Res() res: Response) {
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
      return sendResponse(res, httpStatusCodes.Created, "success", "Create Task", task)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  @ApiOperation({ summary: 'Get all Tasks' })
  @ApiResponse({ status: 200, description: 'List of Tasks' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
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
  @ApiOperation({ summary: 'Get Tasks of a Project' })
  @ApiResponse({ status: 200, description: 'List of Tasks of Project' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"})
  @ApiNotFoundResponse({ description: 'Not Found'}) 
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
  @ApiOperation({ summary: 'Get Single Task' })
  @ApiResponse({ status: 200, description: 'Get Single Task' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)

      if (!task.project_id) {
        throw new NotFoundException('The project associated with task does not exsits');
      }

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
  @ApiOperation({summary:'Update Task'})
  @ApiResponse({ status: 200, description: 'Update Task' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  @Patch(':id')
  async update(@Param('id') id: string, @Body(StartDateValidationPipe) updateTaskDto: UpdateTaskDto, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)

      if (!task.project_id) {
        throw new NotFoundException('The project associated with task does not exsits');
      }

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
  @ApiOperation({summary:'Assign Task To User'})
  @ApiCreatedResponse({ status: 201, description: 'Assign Task to User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiConflictResponse({description:"Conflict Exception"})
  @ApiNotFoundResponse({ description: 'Not Found'})
  @ApiBody({
    description: 'Assign Task To User',
    type: CreateTaskUserDto,
  })
  async assignTaskToUser(
    @Body() taskUserData: CreateTaskUserDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const task = await this.taskService.findOne(taskUserData.task_id);

      if (!task.project_id) {
        throw new NotFoundException('The project associated with task does not exsits');
      }

      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to assign task to user")
        }
      }
      const projectUser = await this.userProjectService.getUsersFromProject(task.project_id.id);

      // check if user is associated with the project or not
      const userProject = projectUser.filter((pu) => pu.user_detail.user_id === taskUserData.user_id);

      if (!userProject || userProject.length === 0) throw new Error('The user you are trying to assgin this task is not associated with the project of this task.')

      const taskUser = await this.taskService.assignTask(taskUserData, task);



      const pmOrAdminId = req['user'].id;
      const taskTitle = task.title;
      const projectId = task.project_id.id;
      UserHasTask.assignedOrRemoveToTask(this.usersService, this.projectService, pmOrAdminId, 'Add', taskUserData, taskTitle, projectId)
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
  @ApiOperation({summary:'Unassign Task To User'})
  @ApiResponse({ status: 200, description: 'Unassign Task to User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiConflictResponse({description:"Conflict Exception"})
  @ApiNotFoundResponse({ description: 'Not Found'})
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

      const pmOrAdminId = req['user'].id;
      const taskTitle = task.title;
      const projectId = task.project_id.id;
      UserHasTask.assignedOrRemoveToTask(this.usersService, this.projectService, pmOrAdminId, 'Remove', taskUserData, taskTitle, projectId)

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
  @ApiOperation({summary:'Delete Task '})
  @ApiResponse({ status: 200, description: 'Assign Task to User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiConflictResponse({description:"Conflict Exception"})
  @ApiNotFoundResponse({ description: 'Not Found'})
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Delete Task")
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
  @ApiOperation({summary:'Complete Task '})
  @ApiResponse({ status: 200, description: 'Complete Task' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  async completeTask(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const task = await this.taskService.findOne(+id)
    if (!task.project_id) {
      throw new NotFoundException('The project associated with task does not exsits');
    }
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
    const taskTitle = task.title;
    const pmDetail = await this.usersService.findOne(task.project_id.pm_id.id)
    const pmEmail = pmDetail.email;
    const statusChange = await this.taskService.completeTask(+id);
    TaskStatus.TaskStatusUpdate(pmEmail, id, 'completed', this.taskService, taskTitle, this.projectService)
    return sendResponse(res, httpStatusCodes.OK, "sucess", "Complete Task", statusChange)
  }


  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get("/:id/users")
  @ApiOperation({summary:'Get Users In Task'})
  @ApiResponse({ status: 200, description: 'Get Users In Task' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  async getUsersInTask(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id);
      if (!task) {
        throw new Error('Task with given id does not exists');
      }
      if (!task.project_id) {
        throw new NotFoundException('The project associated with task does not exsits');
      }
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to fetch all user of a task")
        }
      }
      const userEmailsInTask = await this.taskService.getUsersInTask(Number(id));
      return sendResponse(res, httpStatusCodes.OK, 'success', 'Get All Users of a task', userEmailsInTask)
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard)
  @Get('/assigned/:id')
  @ApiOperation({summary:'Get All Tasks of User'})
  @ApiResponse({ status: 200, description: 'Get All Tasks of User' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  async getAllTasksOfUser(
    @Req() req: Request,
    @Res() res: Response,
    @Param('id') id: string
  ) {
    try {
      if (req['user']?.role !== 'admin') {
        if (req['user']?.id !== parseInt(id)) {
          throw new ForbiddenException('Access Denied')
        }
      }

      const tasks = await this.taskService.getAllTasksAssignedToUser(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all tasks assigned to user',
        tasks
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get('/assigned/projects/:projectId/users/:userId')
  @ApiOperation({summary:'Get All Tasks of User from Project'})
  @ApiResponse({ status: 200, description: 'Get All Tasks of User from Project' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid token' })
  @ApiForbiddenResponse({  description: 'Forbidden Exception' })
  @ApiBadRequestResponse({description:"BadRequest Exception"}) 
  @ApiNotFoundResponse({ description: 'Not Found'})
  async getAllTasksOfUserFromProject(
    @Req() req: Request,
    @Res() res: Response,
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    try {
      const project = await this.projectService.findOne(+projectId);

      if (!project) throw new BadRequestException('Project with given id does not exsits');

      if (req['user']?.role === 'pm') {
        if (req['user']?.id !== project.pm_id.id) {
          throw new ForbiddenException('Access Denied');
        }
      }

      const tasks = await this.taskService.getAllTasksAssignedToUserFromProject(+projectId, +userId);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all tasks assigned to user from project',
        tasks
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}

