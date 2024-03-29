import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, BadRequestException } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: Request, @Res() res: Response) {
    try {
      const project = await this.projectService.create(createProjectDto);
      return sendResponse(res, httpStatusCodes.Created, "success", "Create project", project)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  async findAll(@Req() req: Request, @Res() res: Response) {
    try {
      const projects = await this.projectService.findAll();
      return sendResponse(res, httpStatusCodes.OK, "success", "Get All Projects", projects)
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  @Get()
  async findOne(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const project = await this.projectService.findOne(+id);
      return sendResponse(res, httpStatusCodes.OK, "success", "Get project by id", project)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto, @Req() req: Request, @Res() res: Response) {
    try {
      await this.projectService.update(+id, updateProjectDto);
      return sendResponse(res, httpStatusCodes.OK, "success", "Update Project", null)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      await this.projectService.remove(+id);
      return sendResponse(res, httpStatusCodes.OK, "success", "Delete project", null)
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
