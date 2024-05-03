import { Request } from 'express';
import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, NotFoundException, UseGuards, BadRequestException, HttpException, ForbiddenException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { TaskService } from 'src/task/task.service';
import { UserComment } from 'src/notification/serviceBasedEmail/userHasComment';
import { UsersService } from 'src/users/users.service';
import { ProjectService } from 'src/project/project.service';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Comment } from './entities/comment.entity';

@ApiTags('Comments')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,private readonly taskService:TaskService, private readonly projectService:ProjectService,private readonly usersService:UsersService) {}


  @UseGuards(AdminGuard)
  @Get()
  @ApiResponse({status:200,description:"List of comments"})
  @ApiForbiddenResponse({description:"Only admin can access."})
  @ApiUnauthorizedResponse({description:"Missing or invalid token."})
  async findAll(@Req() req, @Res() res) {
    try{
      const result = await this.commentsService.findAll();
      sendResponse(res,httpStatusCodes.OK,'Ok','Get all comments',result);
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request']);
    }
  }

  @Get('/my')
  @ApiOkResponse({description:"List of your comments."})
  @ApiUnauthorizedResponse({description:"Missing or invalid token."})
  async findMyComments(@Req() req,@Res() res){
    try{
      const result=await this.commentsService.findByEmp(req.user.id);
      sendResponse(res,httpStatusCodes.OK,'ok','Get your comments',result)
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request']);
    }
  }

  @Get(':task_id')
  @ApiOkResponse({description:"List of comments of a task."})
  @ApiUnauthorizedResponse({description:"Missing or invalid token."})
  @ApiForbiddenResponse({description:"Task is of others."})
  async findAllCommentsByTask(@Param('task_id') task_id: string,@Req() req, @Res() res) {
    try{
      const task=await this.taskService.findOne(+task_id);
      if(!task){
        throw new NotFoundException("Task not found.");
      }

      let result;
      if(req.user.role==='admin'){
        result=await this.commentsService.findByTask(+task_id);
      }
      else if(req.user.role==='pm'){
        const taskBelongsToPM=await this.commentsService.taskBelongsToPM(+task_id,req.user.id);
        if(!taskBelongsToPM){
          throw new ForbiddenException("Task does not belongs to your projects.");
        }
        
        result = await this.commentsService.findByTask(+task_id);
      }
      else{
        const taskAssigned=await this.taskService.findTaskUser(+task_id,req.user.id);
        if(!taskAssigned){
          throw new ForbiddenException("Task is not assigned to you.");
        }

        result = await this.commentsService.findByTaskForEmp(+task_id,req.user.id);
      }

      sendResponse(res,httpStatusCodes.OK,'ok','Get comments for a task',result);
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request']);
    }

  }

  @Post()
  @ApiCreatedResponse({description:"Comment added."})
  @ApiUnauthorizedResponse({description:"Missing or invalid token."})
  @ApiForbiddenResponse({description:"PM or employee can comment on their tasks."})
  async create(@Body() createCommentDto: CreateCommentDto,@Req() req, @Res() res) {
    const {task_id}=createCommentDto;
    try{ 
      if(req.user.role==='admin'){
        throw new ForbiddenException("Admin cannot comment on tasks.");
      }

      if(req.user.role==='pm'){
        const taskBelongsToPM=await this.commentsService.taskBelongsToPM(+task_id,req.user.id);
        if(!taskBelongsToPM){
          throw new ForbiddenException("Task does not belongs to your projects.");
        }
      }
      else if(req.user.role==='employee'){
        const taskAssigned=await this.taskService.findTaskUser(+task_id,req.user.id);
        if(!taskAssigned){
          throw new ForbiddenException("Task is not assigned to you.");
        }
      }
      const pmId=req['user'].id;
      const pmDetail=await this.usersService.findOne(pmId);
      const pmEmail=pmDetail.email;

      const comment=await this.commentsService.create(req.user.id,createCommentDto);
      UserComment.UserHasComment(pmEmail,task_id,comment.content,'created',this.taskService,this.projectService);
      sendResponse(res,httpStatusCodes.Created,'Created','Create comment',comment);
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request']);
    }
  }

  @Patch(':id')
  @ApiUnauthorizedResponse({description:"Missing or invalid token."})
  @ApiOkResponse({description:"Comment updated."})
  @ApiNotFoundResponse({description:"Comment with given id not found."})
  @ApiForbiddenResponse({description:"Comment is of others."})
  async update(@Param('id') id: string, @Body() updateCommentDto: UpdateCommentDto,@Req() req,@Res() res) {
    try{
      let affected=await this.commentsService.updateWithEmpId(+id,req.user.id,updateCommentDto);
      if(!affected){
        throw new NotFoundException("Comment not found or Comment is of other user.");
      }
  
      sendResponse(res,httpStatusCodes.OK,'ok','Comment update',null)
    }
    catch(err){
      throw new HttpException(err.message,err.status || httpStatusCodes['Bad Request']);
    }
  }

}
