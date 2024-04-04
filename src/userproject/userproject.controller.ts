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
} from '@nestjs/common';
import { UserprojectService } from './userproject.service';
import { CreateUserprojectDto } from './dto/create-userproject.dto';
import { UpdateUserprojectDto } from './dto/update-userproject.dto';
import { Request, Response } from 'express';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
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
      const userId = createUserprojectDto.user_id;
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new BadRequestException('User does not exists');
      }

      const userRole = user.role;
      if (userRole === 'pm' || userRole === 'admin') {
        throw new ForbiddenException(
          'You can only add employees in the project. no admin and no pm can be added',
        );
      }

      const projectId = createUserprojectDto.project_id;
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        throw new BadRequestException("Project doesn't exist");
      }

      if (req['user']?.role === 'pm' && project.pm_id.id !== req['user'].id) {
        throw new ForbiddenException(
          'You can add members to your projects only',
        );
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
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete('/users')
  async removeUserFromProject(
    @Body() userProjectData: CreateUserprojectDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const projectId = userProjectData.project_id;
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        throw new BadRequestException("Project doesn't exist");
      }

      if (req['user']?.role === 'pm' && project.pm_id.id !== req['user'].id) {
        throw new ForbiddenException(
          'You can delete members of your projects only',
        );
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
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  findAll() {
    return this.userprojectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userprojectService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserprojectDto: UpdateUserprojectDto,
  ) {
    return this.userprojectService.update(+id, updateUserprojectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userprojectService.remove(+id);
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get('/users/:projectId')
  async getUserbyProjectId(
    @Param('projectId') projectId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];

      const users =
        await this.userprojectService.getUsersFromProject(projectId);
      if (!users) {
        throw new NotFoundException('Users does not exists for the project');
      }

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
        if (user?.role === 'employee') {
          const data = users.filter((u) => {
            return u.user_detail.user_id === user.id;
          });
          if (data.length === 0)
            throw new ForbiddenException(
              'You are not the part of this project',
            );
        }
      }

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all users of the project',
        users,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get('/projects/:userId')
  async getProjectsByUserId(
    @Param('userId') userId: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const projects =
        await this.userprojectService.getProjectsFromUser(userId);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get all projects of the user',
        projects,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
