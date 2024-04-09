import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  ForbiddenException,
  UseInterceptors,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { httpStatusCodes, sendResponse } from '../../utils/sendresponse';
import { Request, Response } from 'express';
import { ProjectManagerGuard } from '../auth/Guards/pm.guard'
import { AuthGuard } from '../auth/Guards/auth.guard';
import { AdminGuard } from '../auth/Guards/admin.guard';
import { AdminProjectGuard } from '../auth/Guards/adminProject.guard';
import { StartDateInterceptor } from '../Interceptors/startDateInterceptor';
import { EndDateInterceptor } from '../Interceptors/endDateInterceptor';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @UseGuards(AuthGuard, ProjectManagerGuard)
  @UseInterceptors(StartDateInterceptor, EndDateInterceptor)
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];

      if (user.id !== createProjectDto.pm_id) {
        throw new ForbiddenException('Access Denied')
      }
      const project = await this.projectService.create(createProjectDto);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Create project',
        project,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const projects = await this.projectService.findAll();
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get All Projects',
        projects,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const project = await this.projectService.findOne(+id);

      if (!project) {
        throw new NotFoundException('Project with given id does not exists')
      }

      if (user?.role === 'pm') {
        if (!project.pm_id || (user?.id !== project.pm_id.id)) {
          throw new ForbiddenException('Access Denied')
        }
      }

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get project by id',
        project,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @UseInterceptors(StartDateInterceptor, EndDateInterceptor)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const project = await this.projectService.findOne(+id);

      if (!project) {
        throw new NotFoundException('Project with given id does not exists')
      }

      if (user?.role === 'pm') {
        if (!project.pm_id || (user?.id !== project.pm_id.id)) {
          throw new ForbiddenException('Access Denied')
        }
      }
      await this.projectService.update(+id, updateProjectDto);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Update Project',
        null,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const project = await this.projectService.findOne(+id);

      if (!project) {
        throw new NotFoundException('Project with given id does not exists')
      }

      if (user?.role === 'pm') {
        if (!project.pm_id || (user?.id !== project.pm_id.id)) {
          throw new ForbiddenException('Access Denied')
        }
      }
      await this.projectService.remove(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Delete project',
        null,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Patch('/complete/:id')
  async completeProject(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const project = await this.projectService.findOne(+id);

      if (req['user'].role === 'pm') {
        if (req['user'].id !== project.pm_id.id) {
          throw new ForbiddenException('Access denied to change the project status');
        }
      }

      await this.projectService.completeProject(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Complete project',
        null
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
