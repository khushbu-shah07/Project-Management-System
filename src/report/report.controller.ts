import { Controller, Get, Param, HttpException, Req, Res, ForbiddenException, UseGuards, BadRequestException } from '@nestjs/common';
import { ReportService } from './report.service';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminProjectGuard } from 'src/auth/Guards/adminProject.guard';
import { ProjectService } from 'src/project/project.service';

@Controller('projects')
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly projectService: ProjectService
  ) { }

  @UseGuards(AuthGuard, AdminProjectGuard)
  @Get(':id/report')
  async generateProjectReport(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response
  ) {
    try {
      const project = await this.projectService.findOne(+id);

      if(!project) throw new BadRequestException('Project with given id does not exists');

      if (req['user']?.role === 'pm') {
        if (req['user']?.id !== project.pm_id.id) {
          throw new ForbiddenException('Access Denied')
        }
      }

      const projectReport = await this.reportService.generateReport(+id);

      return sendResponse(
        res,
        httpStatusCodes.OK,
        'success',
        'Generate Project Report',
        projectReport
      )
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
