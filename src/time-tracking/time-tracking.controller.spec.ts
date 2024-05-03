import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackingController } from './time-tracking.controller';
import { TimeTrackingService } from './time-tracking.service';
import { TaskService } from 'src/task/task.service';
import { ProjectService } from 'src/project/project.service';
import { AuthGuard } from 'src/auth/Guards/auth.guard';
import { TaskHour } from './entities/time-tracking.entity';
import { title } from 'process';
import { CreateTimeTrackingDto } from './dto/create-time-tracking.dto';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { UpdateTimeTrackingDto } from './dto/update-time-tracking.dto';
import { UserInDepartment } from 'src/notification/serviceBasedEmail/userInDepartment';
import { privateDecrypt } from 'crypto';
import exp from 'constants';
import { escape } from 'querystring';

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
    }
  })
  return mockRequest;
}

describe('TimeTrackingController', () => {
  let controller: TimeTrackingController;

  const log={
    id:1,
    taskUser_id:1,
    hours:3,
    description:'...',
    created_at:new Date(),
    updated_at:new Date(),
  }

  const mockTimeTrackingService={
    findAll:jest.fn().mockResolvedValue([log]),
    create:jest.fn().mockResolvedValue(log),
    getLogsByEmp:jest.fn().mockResolvedValue([log]),
    getTaskHoursByTask:jest.fn().mockResolvedValue([log]),
    getByProject:jest.fn().mockResolvedValue([log]),
    update:jest.fn().mockResolvedValue(1),
    getLogsOfEmp:jest.fn().mockResolvedValue([log]),
  };

  const taskUser={
    id:1,
    task_id:1,
    user_id:1,
  };
  const task={
    id:1,
    title:'task-t',
    description:'des-task-t',
    status:'created',
  };

  const mockTaskService={
    findOne:jest.fn().mockResolvedValue(task),
    findTaskUserRow:jest.fn().mockResolvedValue(taskUser),
    findTaskUser:jest.fn().mockResolvedValue(1),
    taskBelongsToPM:jest.fn().mockResolvedValue(true),
  };

  const project={
    id:1,
    name:'p1',
    description:'project-1',
    status:'created',
    pm_id:{
      id:1,
    },
  }

  const mockProjectService={
    findOne:jest.fn().mockResolvedValue(project),
  };

  const mockAuthGuard={
    canActivate:jest.fn(()=>true),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimeTrackingController],
      providers: [TimeTrackingService,TaskService,ProjectService],
    })
    .overrideGuard(AuthGuard).useValue(mockAuthGuard)
    .overrideProvider(TimeTrackingService).useValue(mockTimeTrackingService)
    .overrideProvider(TaskService).useValue(mockTaskService)
    .overrideProvider(ProjectService).useValue(mockProjectService)
    .compile();

    controller = module.get<TimeTrackingController>(TimeTrackingController);
  });

  afterEach(async()=>{
    jest.clearAllMocks();
  })

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create a log',()=>{
    it('if employee, should create a log',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const task_id=1,taskUserId=1;
      const createTimeTrackingDto:CreateTimeTrackingDto={
        task_id:task_id,
        hours:3,
        description:'this is ...',
      }

      const result=await controller.create(createTimeTrackingDto,req,res);

      expect(mockTaskService.findTaskUserRow).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockTimeTrackingService.create).toHaveBeenCalledWith(taskUserId,createTimeTrackingDto);

      expect(res.json).toHaveBeenCalledWith({
        operation:'Add time log',
        status:'created',
        data:log,
      });

    })

    it('if not employee, should throw error.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const task_id=1,taskUserId=1;
      const createTimeTrackingDto:CreateTimeTrackingDto={
        task_id:task_id,
        hours:3,
        description:'this is ...',
      }

      await expect(controller.create(createTimeTrackingDto,req,res)).rejects.toMatchObject({message:'Access denied.',status:400});

      expect(mockTaskService.findTaskUserRow).not.toHaveBeenCalled();
      expect(mockTaskService.findOne).not.toHaveBeenCalled();
      expect(mockTimeTrackingService.create).not.toHaveBeenCalled();
      
    })

    it('if employee , should throw error if task is not assigned to him/her.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const task_id=1,taskUserId=1;
      const createTimeTrackingDto:CreateTimeTrackingDto={
        task_id:task_id,
        hours:3,
        description:'this is ...',
      }

      mockTaskService.findTaskUserRow.mockResolvedValueOnce(0);

      await expect(controller.create(createTimeTrackingDto,req,res)).rejects.toMatchObject({message:'Task is not assigned to you.',status:403});

      expect(mockTaskService.findTaskUserRow).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTaskService.findOne).not.toHaveBeenCalled();
      expect(mockTimeTrackingService.create).not.toHaveBeenCalled();
      
    })

    it('if employee, should throw error if task is already completed.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const task_id=1,taskUserId=1;
      const createTimeTrackingDto:CreateTimeTrackingDto={
        task_id:task_id,
        hours:3,
        description:'this is ...',
      }

      mockTaskService.findOne.mockReturnValueOnce({id:1,status:'completed'});

      await expect(controller.create(createTimeTrackingDto,req,res)).rejects.toMatchObject({message:'Task is completed so cannot add time log.',status:400});

      expect(mockTaskService.findTaskUserRow).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id);
      expect(mockTimeTrackingService.create).not.toHaveBeenCalled();
      
    })

    it('should throw error on error from the service function.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const task_id=1,taskUserId=1;
      const createTimeTrackingDto:CreateTimeTrackingDto={
        task_id:task_id,
        hours:3,
        description:'this is ...',
      }

      mockTaskService.findOne.mockRejectedValueOnce({message:'Server error.',status:400});

      await expect(controller.create(createTimeTrackingDto,req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTaskService.findTaskUserRow).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTaskService.findOne).toHaveBeenCalledWith(task_id)
      expect(mockTimeTrackingService.create).not.toHaveBeenCalled();
      
    })

  })

  describe('getMyLogs',()=>{
    it('if employee, should return list of their logs',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const result=await controller.getMyLogs(req,res);

      expect(mockTimeTrackingService.getLogsByEmp).toHaveBeenCalledWith(req['user'].id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get your logs',
        status:'ok',
        data:[log],
      });

    })

    it('if not employee, should throw error',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      await expect(controller.getMyLogs(req,res)).rejects.toMatchObject({message:'Only employees has access.',status:403});

      expect(mockTimeTrackingService.getLogsByEmp).not.toHaveBeenCalled();

    })

    it('should throw error on error from the service function.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      mockTimeTrackingService.getLogsByEmp.mockRejectedValueOnce({message:'Server error.',status:400});

      await expect(controller.getMyLogs(req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.getLogsByEmp).toHaveBeenCalledWith(req['user'].id);
    })

  })

  describe('getByTask',()=>{
    it('if admin, should return list of logs on a given task',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();

      const task_id=1;

      const result=await controller.getByTask(task_id,req,res);

      expect(mockTimeTrackingService.getTaskHoursByTask).toHaveBeenCalledWith(task_id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'get hour logs by task',
        status:'ok',
        data:[log],
      });

      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
      expect(mockTaskService.taskBelongsToPM).not.toHaveBeenCalled();
    })

    it('if pm, should return list of logs on a given task',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const task_id=1;

      const result=await controller.getByTask(task_id,req,res);

      expect(mockTaskService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTimeTrackingService.getTaskHoursByTask).toHaveBeenCalledWith(task_id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'get hour logs by task',
        status:'ok',
        data:[log],
      });

      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
    })

    it('if pm, should throw error if task is not of one of their project',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const task_id=1;

      mockTaskService.taskBelongsToPM.mockReturnValueOnce(false);

      await expect(controller.getByTask(task_id,req,res)).rejects.toMatchObject({message:'Task is not of your project.',status:403});

      expect(mockTaskService.taskBelongsToPM).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTimeTrackingService.getTaskHoursByTask).not.toHaveBeenCalled();

      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
    })

    it('if employee, should return list of logs on a given task',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const task_id=1;

      const result=await controller.getByTask(task_id,req,res);

      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTimeTrackingService.getTaskHoursByTask).toHaveBeenCalledWith(task_id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'get hour logs by task',
        status:'ok',
        data:[log],
      });
      
      expect(mockTaskService.taskBelongsToPM).not.toHaveBeenCalled();
    })

    it('if employee, should throw error if given task is not assigned to him/her',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();
  
      const task_id=1;
  
      mockTaskService.findTaskUser.mockResolvedValueOnce(0);
  
      await expect(controller.getByTask(task_id,req,res)).rejects.toMatchObject({message:'Task is not assigned to you.',status:403});
  
      expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(task_id,req['user'].id);
      expect(mockTimeTrackingService.getTaskHoursByTask).not.toHaveBeenCalled();
      
      expect(mockTaskService.taskBelongsToPM).not.toHaveBeenCalled();
    })

    it('should throw error on error from the service function.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      
      const task_id=1;

      mockTimeTrackingService.getTaskHoursByTask.mockRejectedValueOnce({message:'Server error.',status:400});

      await expect(controller.getByTask(task_id,req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.getTaskHoursByTask).toHaveBeenCalledWith(task_id);
      
      expect(mockTaskService.findTaskUser).not.toHaveBeenCalled();
      expect(mockTaskService.taskBelongsToPM).not.toHaveBeenCalled();
    })


  })

  describe('getLogsOfProject',()=>{
    it('if pm,should return list of logs in project.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const project_id=1;

      const result=await controller.getLogsOfProject(project_id,req,res);

      expect(mockProjectService.findOne).toHaveBeenCalledWith(project_id);
      expect(mockTimeTrackingService.getByProject).toHaveBeenCalledWith(project_id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get logs of a project',
        status:'ok',
        data:[log],
      });
    })

    it('if pm, should throw error if project id is invalid',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const project_id=1;

      mockProjectService.findOne.mockResolvedValueOnce(null);

      await expect(controller.getLogsOfProject(project_id,req,res)).rejects.toMatchObject({message:'Invalid project id.',status:404});

      expect(mockProjectService.findOne).toHaveBeenCalledWith(project_id);
      expect(mockTimeTrackingService.getByProject).not.toHaveBeenCalled();
    })

    it('if pm, should throw error if project is of other.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const project_id=1;

      mockProjectService.findOne.mockResolvedValueOnce({pm_id:{id:3}});

      await expect(controller.getLogsOfProject(project_id,req,res)).rejects.toMatchObject({message:'This project is not yours.',status:403});

      expect(mockProjectService.findOne).toHaveBeenCalledWith(project_id);
      expect(mockTimeTrackingService.getByProject).not.toHaveBeenCalled();
    })

    it('should throw error on error from the service function.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      
      const project_id=1;

      mockTimeTrackingService.getByProject.mockRejectedValueOnce({message:'Server error.',status:400});

      await expect(controller.getLogsOfProject(project_id,req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.getByProject).toHaveBeenCalledWith(project_id);  
      expect(mockProjectService.findOne).toHaveBeenCalledWith(project_id);
    })

  })

  describe('findAll',()=>{
    it('if admin, should return list of all logs',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();

      const result=await controller.findAll(req,res);

      expect(mockTimeTrackingService.findAll).toHaveBeenCalledWith();
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get all time logs.',
        status:'ok',
        data:[log],
      });
    })

    it('should throw error on the error from the service funtion',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();

      mockTimeTrackingService.findAll.mockRejectedValueOnce({message:'Server error.',status:400});

      await expect(controller.findAll(req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.findAll).toHaveBeenCalledWith();
    })

  })

  describe('update',()=>{
    it('should update given log.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const id=1;
      const updatedData:UpdateTimeTrackingDto={
        hours:4,
      }

      const result=await controller.update(id,updatedData,req,res)

      expect(mockTimeTrackingService.update).toHaveBeenCalledWith(id,req['user'].id,updatedData);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Update log',
        status:'success',
        data:{updatedLog:1},
      });

    })

    it('should update given log.',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const id=1;
      const updatedData:UpdateTimeTrackingDto={
        hours:4,
      }

      const result=await controller.update(id,updatedData,req,res)

      expect(mockTimeTrackingService.update).toHaveBeenCalledWith(id,req['user'].id,updatedData);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Update log',
        status:'success',
        data:{updatedLog:1},
      });

    })

    it('should throw error if given taskLog is not found',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const id=1;
      const updatedData:UpdateTimeTrackingDto={
        hours:4,
      }

      mockTimeTrackingService.update.mockReturnValueOnce(0);

      await expect(controller.update(id,updatedData,req,res)).rejects.toMatchObject({message:`Time tracking entry with ID "${id}" not found`,status:404})

      expect(mockTimeTrackingService.update).toHaveBeenCalledWith(id,req['user'].id,updatedData);
      
    })

    it('should throw error on error from the service funtion',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const id=1;
      const updatedData:UpdateTimeTrackingDto={
        hours:4,
      }

      mockTimeTrackingService.update.mockRejectedValueOnce({message:'Server error.',status:400})

      await expect(controller.update(id,updatedData,req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.update).toHaveBeenCalledWith(id,req['user'].id,updatedData);

    })

  })

  describe('getUserTimeLogs',()=>{
    it('if pm, should return list of logs of an given user',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const user_id=1;

      const result=await controller.getUserTimeLogs(user_id,req,res);

      expect(mockTimeTrackingService.getLogsOfEmp).toHaveBeenCalledWith(user_id,req['user'].id);
      expect(res.json).toHaveBeenCalledWith({
        operation:'Get log hours of user',
        status:'success',
        data:[log],
      });
    })

    it('should throw error on error from the service funtion',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'employee');
      const res = getMockResponse();

      const user_id=1;

      mockTimeTrackingService.getLogsOfEmp.mockRejectedValueOnce({message:'Server error.',status:400})

      await expect(controller.getUserTimeLogs(user_id,req,res)).rejects.toMatchObject({message:'Server error.',status:400});

      expect(mockTimeTrackingService.getLogsOfEmp).toHaveBeenCalledWith(user_id,req['user'].id);
      
    })

  })

  
});
