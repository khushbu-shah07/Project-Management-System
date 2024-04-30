import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  HttpException,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { ProjectService } from '../project/project.service'
import { UserInTeam } from 'src/notification/serviceBasedEmail/userInTeam';
import { TaskUser } from 'src/task/entities/task-user.entity';
import { UserprojectService } from 'src/userproject/userproject.service';
import { UsersService } from 'src/users/users.service';

@Controller('team')
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly userprojectService: UserprojectService,
    private readonly projectService: ProjectService,
    private readonly usersService:UsersService
  ) { }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post()
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const projectId = createTeamDto.project_id;
      const project = await this.projectService.findOne(projectId);
      if (!project) {
        throw new BadRequestException("Project doesn't exist");
      }

      // check if the project is of that pm
      if (req['user'].role === 'pm') {
        if (project.pm_id.id !== req['user'].id) {
          throw new ForbiddenException('Access Denied')
        }
      }

      const users =
        await this.userprojectService.getUsersFromProject(projectId);
      if (!users || users.length === 0) {
        throw new NotFoundException(
          'Users does not exists for this project so u cannot create a team',
        );
      }

      if (user?.role === 'pm' && project.pm_id.id !== user.id) {
        throw new ForbiddenException(
          'You can only create teams for your projects',
        );
      }

      const team = await this.teamService.create(createTeamDto);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Team Created',
        team,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  // Listing of all teams => data would be all teamIds 
  @UseGuards(AuthGuard, AdminGuard)
  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const teams = await this.teamService.findAll();
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Teams Retrieved Successfully!',
        teams,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  // removing user from teams -- correction remaining
  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete('/users')
  async removeUserFromTeam(
    @Body() teamUserData: CreateTeamUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.teamService.removeUserFromTeam(teamUserData);

      
      const pmOrAdminId=req['user'].id;

      const userId=teamUserData.user_id;
    const teamId=teamUserData.team_id
     
      UserInTeam.addOrRemoveToTeam(this.usersService,this.projectService,this.teamService,pmOrAdminId,'Remove',userId,teamId)

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'User removed from team',
        null,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  // Retrives a single team  --> doubt
  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const team = await this.teamService.findOne(+id);

      if (!team) {
        throw new NotFoundException("This team doesn't exist!");
      }

      if (user?.role === 'pm') {
        if (!team.project_id || team?.project_id['pm_id']['id'] !== user.id) {
          throw new ForbiddenException('Access Denied');
        }
      }

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Team Retrieved Successfully by teamId!',
        team,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTeamDto: UpdateTeamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user'];
      const team = await this.teamService.findOne(+id);

      if (!team) {
        throw new NotFoundException("This Team doesn't exist!");
      }
      if (user?.role === 'pm') {
        if (!team.project_id || team?.project_id['pm_id']['id'] !== user.id) {
          throw new ForbiddenException('Access Denied');
        }
      }
      await this.teamService.update(+id, updateTeamDto);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        `The Team has been updated successfully`,
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
      const team = await this.teamService.findOne(+id);

      if (!team) {
        throw new NotFoundException("This team doesn't exist!");
      }

      if (user?.role === 'pm') {
        if (!team.project_id || team?.project_id['pm_id']['id'] !== user.id) {
          throw new ForbiddenException('Access Denied');
        }
      }
      await this.teamService.remove(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        `The Team has been deleted successfully`,
        null,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post('/users')
  async addUserToTeam(
    @Body() teamUserData: CreateTeamUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const teamUser = await this.teamService.addUserToTeam(teamUserData);

      const pmOrAdminId=req['user'].id;

      const userId=teamUserData.user_id;
    const teamId=teamUserData.team_id
     
      UserInTeam.addOrRemoveToTeam(this.usersService,this.projectService,this.teamService,pmOrAdminId,'Add',userId,teamId)

      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Added user to team',
        teamUser,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get('/users/:id')
  async getAllTeamUser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const teamUsers = await this.teamService.findAllTeamUsers(+id);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Get Team Users',
        teamUsers,
      );
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
