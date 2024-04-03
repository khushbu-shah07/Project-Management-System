import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Req, Res, UseGuards, ForbiddenException, UseInterceptors, NotFoundException } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Request } from 'supertest';
import { Response } from 'express';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Task } from './entities/task.entity';
import { ProjectService } from 'src/project/project.service';
import { StartDateInterceptor } from 'src/Interceptors/startDateInterceptor';
import { EndDateInterceptor } from 'src/Interceptors/endDateInterceptor';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { CreateTaskUserDto } from './dto/create-task-user.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService,
    private readonly projectService: ProjectService) { }

  @Post()
  @UseGuards(AuthGuard, AdminProjectGuard)
  @UseInterceptors(StartDateInterceptor, EndDateInterceptor)
  async create(@Body() createTaskDto: CreateTaskDto, @Req() req: Request, @Res() res: Response) {
    try {
      let task: Partial<Task>;
      console.log(req['user'].role);
      if (req['user'].role === 'admin') {
        task = await this.taskService.create(createTaskDto)
      }

      else {
        const project = await this.projectService.findOne(createTaskDto.project_id);

        // Only the Project Manager of the project can add task
        if (project.pm_id['id'] === req['user'].id) {
          task = await this.taskService.create(createTaskDto)
          console.log(task['project_id']['pm_id']);
        }
        else {
          throw new ForbiddenException("Only Pm can Add Task of the Project has Access")
        }
      }
      return sendResponse(res, httpStatusCodes.Created, "success", "Craete Task", task)
    } catch (error) {
      throw new BadRequestException("Error in Create Task", error.message)
    }
  }

  @Get()
  @UseGuards(AuthGuard, AdminGuard)
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const tasks = await this.taskService.findAll()
      return sendResponse(res, httpStatusCodes.OK, "success", "Get All Tasks", tasks)
    } catch (error) {
      throw new BadRequestException("Error in FindAll Tasks", error.message)
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
      throw new NotFoundException("Error in FindOne Task", error.message)
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @UseInterceptors(StartDateInterceptor, EndDateInterceptor)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @Req() req: Request, @Res() res: Response) {
    try {
      const task = await this.taskService.findOne(+id)
      if (req['user'].role === "pm") {
        if (req['user'].id !== task.project_id.pm_id.id) {
          throw new ForbiddenException("Access Denied to Update Project")
        }
      }
      await this.taskService.update(+id, updateTaskDto)
      return sendResponse(res, httpStatusCodes.OK, "success", "Update User", null)
    } catch (error) {
      throw new BadRequestException("Error in Update Task", error.message)
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

      const taskUser = await this.taskService.assignTask(taskUserData);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Assign task to user',
        taskUser
      )
    } catch (error) {
      throw new BadRequestException(error.message);
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
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Delete task user',
        null
      )
    } catch (error) {
      throw new BadRequestException(error.message);
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
      throw new NotFoundException("Error in Delete Task", error.message)
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
    const statusChange = await this.taskService.completeTask(+id)
    return sendResponse(res,httpStatusCodes.OK,"sucess","Complete Task",statusChange)
  }
}

