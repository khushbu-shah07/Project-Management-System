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
  UsePipes,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { httpStatusCodes, sendResponse } from '../../utils/sendresponse';
import { Request, Response } from 'express';
import { ProjectManagerGuard } from '../../src/auth/Guards/pm.guard';
import { AuthGuard } from '../../src/auth/Guards/auth.guard';
import { AdminGuard } from '../../src/auth/Guards/admin.guard';
import { AdminProjectGuard } from '../../src/auth/Guards/adminProject.guard';
import { UserprojectService } from 'src/userproject/userproject.service';
import { ProjectStatus } from '../notification/serviceBasedEmail/projectStatusUpdate'
import { UsersService } from 'src/users/users.service';
import { StartDateValidationPipe } from '../Pipes/startDatePipe';
import { EndDateValidationPipe } from '../Pipes/endDatePipe';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService, private readonly userProject: UserprojectService, private readonly usersService: UsersService) { }

  @UseGuards(AuthGuard, ProjectManagerGuard)
  @Post()
  @ApiOperation({ summary: 'Create project' })
  @ApiCreatedResponse({ description: 'Project created' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
  @ApiBody({
    description: 'Project details',
    type: CreateProjectDto
  })
  async create(
    @Body(StartDateValidationPipe, EndDateValidationPipe) createProjectDto: CreateProjectDto,
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
  @ApiOperation({ summary: 'Get all projects' })
  @ApiResponse({ description: 'List of projects' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Get project from id' })
  @ApiResponse({ description: 'Get single project' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  @ApiResponse({ description: 'Updates a project' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
  async update(
    @Param('id') id: string,
    @Body(StartDateValidationPipe) updateProjectDto: UpdateProjectDto,
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
  @ApiOperation({ summary: 'Delete project' })
  @ApiResponse({ description: "deletes a project" })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
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
  @ApiOperation({ summary: 'Complete project' })
  @ApiResponse({ description: 'Completes a project' })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid bearer token' })
  @ApiForbiddenResponse({ description: 'Forbidden exception' })
  @ApiBadRequestResponse({ description: 'Badrequest exception' })
  async completeProject(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const project = await this.projectService.findOne(+id);

    if (req['user'].role === 'pm') {
      if (req['user'].id !== project.pm_id.id) {
        throw new ForbiddenException('Access denied to change the project status');
      }
    }
    await this.projectService.completeProject(+id);

    const pmOrAdminEmail = project.pm_id.email;
    const projectId = project.id;
    const projectName = project.name

    const allUsersInProject = await this.userProject.getUsersFromProject(projectId)

    const allUsersId = [];
    for (const user in allUsersInProject) {
      const userID = allUsersInProject[user].user_detail.user_id;
      if (userID) {
        allUsersId.push(userID)
      }
    }

    let allUsersEmail = [];
    for (const userId in allUsersId) {
      const usersDetail = await this.usersService.findOne(Number(allUsersId[userId]));
      allUsersEmail.push(usersDetail.email)

    }
    console.log("all users", allUsersEmail)
    ProjectStatus.projectStatusUpdate(pmOrAdminEmail, allUsersInProject, 'completed', projectName, this.usersService)

    return sendResponse(
      res,
      httpStatusCodes.OK,
      'success',
      'Complete project',
      allUsersInProject
    )
  }
}
