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
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { TeamUser } from './entities/team-user.entity';
import { CreateTeamUserDto } from './dto/create-team-user.dto';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Post()
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const team = await this.teamService.create(createTeamDto);
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Team Created',
        team,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

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
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Delete('/users')
  async removeUserFromTeam(
    @Body() teamUserData: CreateTeamUserDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      await this.teamService.removeUserFromTeam(teamUserData);
      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'User removed from team',
        null,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
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
      throw new NotFoundException(error.message);
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
      throw new BadRequestException(error.message);
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
      throw new BadRequestException(error.message);
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
      return sendResponse(
        res,
        httpStatusCodes.Created,
        'success',
        'Added user to team',
        teamUser,
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get('/users/:id')
  async getAllTeamUser(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const teamUsers = await this.teamService.findAllTeamUsers(+id);
    return sendResponse(
      res,
      httpStatusCodes.OK,
      'success',
      'Get Team Users',
      teamUsers,
    );
  }
}
