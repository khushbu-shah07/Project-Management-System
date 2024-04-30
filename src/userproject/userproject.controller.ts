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
  BadRequestException,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import { UserprojectService } from './userproject.service';
import { CreateUserprojectDto } from './dto/create-userproject.dto';
import { UpdateUserprojectDto } from './dto/update-userproject.dto';
import { Request, Response } from 'express';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { User } from 'src/users/entities/user.entity';
import { ProjectService } from 'src/project/project.service';
import { UsersService } from 'src/users/users.service';

@Controller('userproject')
export class UserprojectController {
  constructor(
    private readonly userprojectService: UserprojectService,
    private readonly projectService: ProjectService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post()
  async create(
    @Body() createUserprojectDto: CreateUserprojectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const { project_id, user_id } = createUserprojectDto;

      const [project, user] = await Promise.all([
        this.projectService.findOne(project_id),
        this.usersService.findOne(user_id),
      ]);

      if (user.role !== 'employee') {
        throw new ForbiddenException('Only employess can be added');
      }
      if (req['user'].id !== project.pm_id.id) {
        throw new ForbiddenException('Access Denied');
      }

      const userproject =
        await this.userprojectService.create(createUserprojectDto);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'UserProject created successfully',
        userproject,
      );
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else {
        throw new BadRequestException(error.message);
      }
    }
  }

  @Delete('/users')
  async removeUserFromProject(
    @Body() userProjectData: CreateUserprojectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const project = await this.projectService.findOne(
        userProjectData.project_id,
      );

      if (req['user'].id !== project.pm_id.id) {
        throw new ForbiddenException('Access Denied');
      }

      await this.userprojectService.removeUserFromProject(userProjectData);
      sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'User removed from the project',
        null,
      );
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || httpStatusCodes['Bad Request'],
      );
    }
  }

  @UseGuards(AuthGuard)
  @Get('/users/projectId/:projectId')
  async getUserbyProjectId(
    @Param('projectId') projectId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];

      const users =
        await this.userprojectService.getUsersFromProject(projectId);

      if (user?.role === 'pm') {
        const project = await this.projectService.findOne(projectId);
        if (!project) {
          throw new BadRequestException("Project doesn't exist");
        }
        if (project.pm_id.id !== user.id) {
          throw new ForbiddenException(
            "You can not access other project's members list",
          );
        }
      }

      if (user?.role === 'employee') {
        const data = users.filter((u) => {
          return u.user_detail.user_id === user.id;
        });
        console.log(data);

        if (data.length === 0)
          throw new ForbiddenException('You are not the part of this project');
      }

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all users of the project',
        users,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(
          error.message,
          error.status || httpStatusCodes['Bad Request'],
        );
      }
    }
  }

  @UseGuards(AuthGuard)
  @Get('/projects/userId/:userId')
  async getProjectsByUserId(
    @Param('userId') userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (req['user']?.role !== 'admin') {
        if (req['user']?.id !== parseInt(userId)) {
          throw new ForbiddenException('Access Denied');
        }
      }
      const projects =
        await this.userprojectService.getProjectsFromUser(+userId);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all projects of the user',
        projects,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new HttpException(
          error.message,
          error.status || httpStatusCodes['Bad Request'],
        );
      }
    }
  }
}
