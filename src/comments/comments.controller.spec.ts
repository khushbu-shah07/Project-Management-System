import { getMockReq, getMockRes } from '@jest-mock/express';
import { CanActivate, HttpException, Res, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { TaskService } from 'src/task/task.service';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { AdminGuard } from 'src/auth/Guards/admin.guard';
import { ProjectService } from 'src/project/project.service';
import { ProjectModule } from 'src/project/project.module';
import { UsersModule } from 'src/users/users.module';
import { Comment } from './entities/comment.entity';
import { httpStatusCodes, sendResponse } from 'utils/sendresponse';
import { CreateCommentDto } from './dto/create-comment.dto';
import { create } from 'domain';
import { UpdateCommentDto } from './dto/update-comment.dto';

const getMockResponse = () => {
  const mockResponse = getMockRes()
  return mockResponse.res;
}

const getMockAuthentiatedRequest = (body: any, userId: number, role: string) => {
  const mockRequest = getMockReq({
    body: body,
    user: {
      id: userId,
      role: role
    },
  })
  return mockRequest;
}

describe('<-- CommentsController -->', () => {
  let controller: CommentsController,commentsService:CommentsService,taskService:TaskService;

  const comment={
    id:1,
    emp_id:{
      id:1,
    },
    task_id:{
      id:4,
    },
    content:"This is a comment.",
    edited:false,
    created_at:new Date(),
    updated_at:new Date(),
  };

  const mockCommentsService={
    create:jest.fn().mockResolvedValue(comment),
    findAll:jest.fn(async ()=>{return [comment]}),
    findByEmp:jest.fn(async (emp_id:number)=>{
      return [comment];
    }),
    taskBelongsToPM:jest.fn().mockResolvedValue(true),
    findByTask:jest.fn().mockResolvedValue([comment]),
    // findByTask:jest.fn(),
    findByTaskForEmp:jest.fn().mockResolvedValue([comment]),
    updateWithEmpId:jest.fn().mockResolvedValue(1)

  };

  const task={
    id:2,
    title:'t1',
    description:'this is a task t1.',
    status:'created',
    priority:'high',
    startDate:new Date(),
    expectedEndDAte:new Date(),
    project_id:1,
  }

  const mockTaskService={
    findOne:jest.fn().mockResolvedValue(task),
    findTaskUser:jest.fn().mockResolvedValue(1),
  };

  const mockAuthGuard={
    canActivate:jest.fn(()=>true),
  };

  const mockAdminGuard={
    canActivate:jest.fn(()=>true),
  }
  

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService,TaskService,
        {
          provide:ProjectService,
          useValue:{},
        },
        {
          provide:UsersService,
          useValue:{},
        }
      ],
    })
    .overrideGuard(AuthGuard).useValue(mockAuthGuard)
    // .overrideGuard(AdminGuard).useValue(mockAdminGuard)
    .overrideProvider(CommentsService).useValue(mockCommentsService)
    .overrideProvider(TaskService).useValue(mockTaskService)
    .compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService=module.get<CommentsService>(CommentsService);
    taskService=module.get<TaskService>(TaskService);

  });

  afterEach(async()=>{
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find all comments',()=>{
    it('findAll -> should return all comments',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'admin');
      const res=getMockResponse();
  
      // jest.spyOn(mockCommentsService,'findAll').mockResolvedValue({task_id:1,emp_id:1,content:"abc"} )
      const result=await controller.findAll(req,res);
  
      expect(mockCommentsService.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get all comments',
        status:'Ok',
        data:[comment],
      })
      
    });

    it('should throw error on any other error from service.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      mockCommentsService.findAll.mockRejectedValueOnce({message:"some error.",status:400})
      
      try{
        const result=await controller.findAll(req,res);
        expect(result).toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(400);
      }
    })

  })

  describe('find my comments',()=>{
    it('findMyComments -> should return only my comments.',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();
  
      const result = await controller.findMyComments(req,res);
  
      expect(mockCommentsService.findByEmp).toHaveBeenCalledWith(req['user'].id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get your comments',
        status:'ok',
        data:[comment],
      });
  
    });

    it('should throw error on error from service.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm')
      const res=getMockResponse();

      // jest.spyOn(mockAdminGuard,'canActivate').mockResolvedValue(false);
      jest.spyOn(mockCommentsService,'findByEmp').mockRejectedValueOnce({message:'some error.',status:400});

      try{
        const result=await controller.findMyComments(req,res);  
        expect(result).rejects.toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toEqual(400)
      }

      expect(mockCommentsService.findByEmp).toHaveBeenCalledWith(req['user'].id);
      expect(res.json).not.toHaveBeenCalled();
    })

  })

  describe('findAllCommentsByTask -> find all comments by task',()=>{
    it('should return NotFoundException when task is not found.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      jest.spyOn(mockTaskService,'findOne').mockResolvedValueOnce(null);

      try{
        const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);

        expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
        expect(mockCommentsService.findByTask).not.toHaveBeenCalled();
        expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
        expect(mockCommentsService.findByTask).not.toHaveBeenCalled();
        expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
        expect(mockCommentsService.findByTaskForEmp).not.toHaveBeenCalled();

        expect(result).rejects.toThrow();

      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toEqual(404);
      }

    });

    it('for admin, should return list of comments on a task',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'admin');
      const res=getMockResponse();

      const task_id=2;

      const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);

      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockCommentsService.findByTask).toHaveBeenCalledWith(task_id);
      
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get comments for a task',
        status:'ok',
        data:[comment],
      })

    });

    it('for PM, should return list of comments on a task of their project',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      jest.spyOn(mockCommentsService,'taskBelongsToPM').mockResolvedValueOnce(true);

      const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);

      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      // expect(mockCommentsService.findByTask).not.toHaveBeenCalledWith(task_id);
      expect(mockCommentsService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id)
      expect(mockCommentsService.findByTask).toHaveBeenCalledWith(task_id)
      
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get comments for a task',
        status:'ok',
        data:[comment],
      })

    })

    it('for PM, should return error when a task is of others project',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      jest.spyOn(mockCommentsService,'taskBelongsToPM').mockResolvedValueOnce(false);

      // await expect(controller.findAllCommentsByTask(task_id.toString(),req,res)).rejects.toThrow(HttpException);
      try{
        const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);
        expect(result).rejects.toThrow();
        // expect(true).toBe(false);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toEqual(403);
      }
      
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockCommentsService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id);
      
      expect(mockCommentsService.findByTask).not.toHaveBeenCalled();
      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
      expect(mockCommentsService.findByTaskForEmp).not.toHaveBeenCalled();

      expect(res.json).not.toHaveBeenCalled();

    })

    it('for employee, should return list of all comments on a given task if task is assigned.',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'employee');
      const res=getMockResponse();

      const task_id=2;

      mockTaskService.findTaskUser.mockResolvedValue(true);

      const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);
      
      
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.findByTaskForEmp).toHaveBeenCalledWith(task_id,req['user'].id);
      
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get comments for a task',
        status:'ok',
        data:[comment],
      })

      expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
      expect(mockCommentsService.findByTask).not.toHaveBeenCalled();

    })

    it('for employee, should return error if given task is not assigned him/her.',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'employee');
      const res=getMockResponse();

      const task_id=2;

      mockTaskService.findTaskUser.mockResolvedValueOnce(false);

      try{
        const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);
        expect(result).rejects.toThrow();
        // expect(true).toBe(false);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toEqual(403);
      }
      
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.findByTaskForEmp).not.toHaveBeenCalled();
      
      expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
      expect(mockCommentsService.findByTask).not.toHaveBeenCalled();

    });

    it('should throw error on any other error from service.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      mockCommentsService.findByTask.mockRejectedValueOnce({message:"some error.",status:400})
      
      try{
        const result=await controller.findAllCommentsByTask(task_id.toString(),req,res);
        expect(result).toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(400);
      }
    })

  })

  describe('Create comment on task',()=>{
    it('for PM, can comment if task belongs one of his/her project',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      mockCommentsService.taskBelongsToPM.mockResolvedValueOnce(true);

      const result=await controller.create(mockComment,req,res);

      expect(mockCommentsService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.create).toHaveBeenCalledWith(req['user'].id,mockComment)
      expect(res.json).toHaveBeenCalledWith({
        operation:'Create comment',
        status:'Created',
        data:comment,
      })

      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();

    });

    it('for PM, should throw forbidden error if task does not belongs to one of their project.',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;

      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      mockCommentsService.taskBelongsToPM.mockResolvedValueOnce(false);

      try{
        const result=await controller.create(mockComment,req,res);
        expect(result).rejects.toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(403);
      }

      expect(mockCommentsService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.create).not.toHaveBeenCalled();
      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
    })

    it('for employee, can comment if task is assigned to him/her',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'employee');
      const res=getMockResponse();

      const task_id=2;
      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      mockTaskService.findTaskUser.mockReturnValueOnce(1);

      const result=await controller.create(mockComment,req,res);

      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.create).toHaveBeenCalledWith(req['user'].id,mockComment)
      expect(res.json).toHaveBeenCalledWith({
        operation:'Create comment',
        status:'Created',
        data:comment,
      })
      
      expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
    });

    it('for employee, should throw error if task is not assigned to the employee.',async ()=>{
      const req=getMockAuthentiatedRequest({},1,'employee');
      const res=getMockResponse();

      const task_id=2;
      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      mockTaskService.findTaskUser.mockReturnValueOnce(0);

      try{
        const result=await controller.create(mockComment,req,res);
        expect(result).rejects.toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(403);
      }

      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockCommentsService.create).not.toHaveBeenCalled();
      expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
    });

    it('for admin, should throw error as admin cannot add comment on the task.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'admin');
      const res=getMockResponse();

      const task_id=2;
      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      try{
        const result=await controller.create(mockComment,req,res);
        expect(result).rejects.toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(403);
      }

      expect(mockCommentsService.taskBelongsToPM).not.toHaveBeenCalled();
      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
      expect(mockCommentsService.create).not.toHaveBeenCalled();

      expect(res.json).not.toHaveBeenCalled();
    });

    it('should throw error on any other error from service.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const task_id=2;
      const mockComment:CreateCommentDto={
        task_id:task_id,
        content:"This is a comment."
      };

      mockCommentsService.create.mockRejectedValueOnce({message:"some error.",status:400})
      
      try{
        const result=await controller.create(mockComment,req,res);
        expect(result).toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(400);
      }
    })

  })

  describe('update comment',()=>{
    it('should update comment if given comment was added by given user.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const dataToUpdate:UpdateCommentDto={
        content:'This is updated comment.'
      }

      const result=await controller.update(comment.id.toString(),dataToUpdate,req,res);

      expect(mockCommentsService.updateWithEmpId).toHaveBeenCalledWith(comment.id,req['user'].id,dataToUpdate);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Comment update',
        status:'ok',
        data:null,
      })

    })

    it('should throw error if given comment is of other user.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const dataToUpdate:UpdateCommentDto={
        content:'This is updated comment.'
      }

      mockCommentsService.updateWithEmpId.mockResolvedValue(0);

      try{
        const result=await controller.update(comment.id.toString(),dataToUpdate,req,res);
        expect(result).rejects.toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(404);
      }

      expect(mockCommentsService.updateWithEmpId).toHaveBeenCalledWith(comment.id,req['user'].id,dataToUpdate);
      expect(res.json).not.toHaveBeenCalled();

    })

    it('should throw error on any other error from service.',async()=>{
      const req=getMockAuthentiatedRequest({},1,'pm');
      const res=getMockResponse();

      const dataToUpdate:UpdateCommentDto={
        content:'This is updated comment.'
      }

      mockCommentsService.updateWithEmpId.mockRejectedValueOnce({message:"some error.",status:400})
      
      try{
        const result=await controller.update(comment.id.toString(),dataToUpdate,req,res);
        expect(result).toThrow(HttpException);
      }
      catch(err){
        expect(err).toBeInstanceOf(HttpException);
        expect(err.getStatus()).toBe(400);
      }
    })

  })

});