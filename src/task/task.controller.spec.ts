import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { Task, TaskPriority, TaskStatus } from 'src/task/entities/task.entity';
import { JwtModule } from '@nestjs/jwt';
import { ProjectService } from 'src/project/project.service';
import { Project, ProjectStatus } from 'src/project/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { Request } from 'express';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { UserprojectService } from 'src/userproject/userproject.service';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { TaskUser } from './entities/task-user.entity';
import { UserprojectModule } from 'src/userproject/userproject.module';
import { ProjectModule } from 'src/project/project.module';
import { ForbiddenException, HttpException } from '@nestjs/common';

describe('TaskController', () => {
  let taskController: TaskController;
  let userRepository: any;

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

  // jest.mock('../auth/Guards/auth.guard', () => ({
  //   ProjectManagerGuard: jest.fn().mockImplementation(() => ({
  //     canActivate: jest.fn(() => true)
  //   })),
  //   AdminGuard: jest.fn().mockImplementation(() => ({
  //     canActivate: jest.fn(() => true)
  //   })),
  //   AdminProjectGuard: jest.fn().mockImplementation(() => ({
  //     canActivate: jest.fn(() => true)
  //   })), 
  //   AuthGuard: jest.fn().mockImplementation(() => ({
  //     canActivate: jest.fn(() => true)
  //   })),
  // }));

  const mockTask = {
    id: 11,
    title: "Test Task",
    description: "This is a test task",
    status: TaskStatus.CREATED,
    priority: TaskPriority.HIGH,
    startDate: new Date().toISOString(),
    expectedEndDate: new Date().toISOString(),
    actualEndDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    project_id:1
  }
  const mockProject = {
    id: 1,
    name: "Test Project",
    description: "This is a test project",
    status: ProjectStatus.CREATED,
    startDate: new Date().toISOString(),
    expectedEndDate: new Date().toISOString(),
    actualEndDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pm_id:{id:1}
  }
  let mockUserProject = {
    id:1,
    user_id:2,
    project_id:3
  }

  let mockTaskService = {
    findAll: jest.fn().mockResolvedValue([mockTask]),
    create: jest.fn().mockResolvedValue(mockTask),
    findOne: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockResolvedValue({affected:1}),
    getAllTaskByPriority: jest.fn().mockResolvedValue([mockTask]),
    getAllProjectTasks:jest.fn().mockResolvedValue([mockTask])

  }

  let mockProjectService = {
    findOne:jest.fn().mockResolvedValue(mockProject)
  }

  let mockUserProjectservice ={
    getUsersfromProject:jest.fn().mockResolvedValue([mockUserProject])
  }
  let mockUserService ={}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[JwtModule],
      controllers: [TaskController],
      providers: [
      {
        provide : TaskService,
        useValue:mockTaskService
      },
      {
        provide : ProjectService,
        useValue:mockProjectService
      },
      {
        provide : UsersService,
        useValue:mockUserService
      },
      {
        provide : UserprojectService,
        useValue:mockUserProjectservice
      },
    ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(taskController).toBeDefined();
  });

  //Create Task Test Cases
  describe("create task",()=>{
    it("Should allow admin to create task and return task",async()=>{
      try {
        const taskData= mockTask
        const req = getMockAuthentiatedRequest({},1,'admin')
        const res = getMockResponse()
        await taskController.create(taskData as unknown as CreateTaskDto,req,res)
        expect(mockTaskService.create).toHaveBeenCalledWith(taskData)
        expect(res.json).toHaveBeenCalledWith({
          operation:'Craete Task',
          status:"success",
          data:mockTask
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })

    it('should allow pm of the project to create task', async () => {
      try {
        const taskData = mockTask
        const req = getMockAuthentiatedRequest({}, 1, "pm")
        const res = getMockResponse()
        await taskController.create(taskData as unknown as CreateTaskDto,req,res) 
        expect(mockProjectService.findOne).toHaveBeenCalledWith(taskData.project_id)
        expect(mockTaskService.create).toHaveBeenCalledWith(taskData)
        expect(res.json).toHaveBeenCalledWith({
          operation:'Craete Task',
          status:"success",
          data:mockTask
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })
    it('should throw forbidden exception for non admin and non project manager user', async () => {
      const taskData = mockTask
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied"
      try {
        await taskController.create(taskData as unknown as CreateTaskDto, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const taskData = mockTask
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.create.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.create(taskData as unknown as CreateTaskDto, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  // Test Case for FindAll Task
  describe("findAll Task",()=>{
    it("Should allow admin to find all task of all projects",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.findAll(req, res,priority);
        expect(mockTaskService.findAll).toHaveBeenCalled()
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get All Tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("Should allow admin to find all task of all projects on the basis of priority",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.findAll(req, res,priority);
        expect(mockTaskService.getAllTaskByPriority).toHaveBeenCalledWith(priority)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get All Tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })

    it('should throw forbidden exception for non admin user', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority:string = "high"
      const errorMessage = "only admin has access"
      try {
        await taskController.findAll(req, res,priority);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority:string = "high"
      const errorMessage = 'Some error occurred';
      mockTaskService.findAll.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.findAll(req, res,priority);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //Get Project tasks
  describe("Get Tasks of Project",()=>{
    it("should allow admin to find all tasks of a project",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`,req, res,priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockTaskService.getAllProjectTasks).toHaveBeenCalledWith(mockProject.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all project tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })

    it("should allow the pm of a project to findAll Tasks of a project",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`,req, res,priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockTaskService.getAllProjectTasks).toHaveBeenCalledWith(mockProject.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all project tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })

    it("should allow the user of the project to findAll Tasks",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'employee');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`,req, res,priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockUserProjectservice.getUsersfromProject).toHaveBeenCalledWith(mockProject.id)
        expect(mockTaskService.getAllProjectTasks).toHaveBeenCalledWith(mockProject.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all project tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("Should allow to get the project task by priorty by admin , pm or employee of project",async()=>{
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'user');
        const res = getMockResponse();
        const priority:string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`,req, res,priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockUserProjectservice.getUsersfromProject).toHaveBeenCalledWith(mockProject.id)
        expect(mockTaskService.getAllProjectTasks).toHaveBeenCalledWith(mockProject.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all project tasks',
          status: 'success',
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden exception for non admin non pm user of a project and non employee of a project",async()=>{
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority:string = "high"
      const errorMessage = "Access Denied to fetch all project tasks"
      try {
        await taskController.getProjectTasks(`${mockProject.id}`,req, res,priority);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority:string = "high"
      const errorMessage = 'Some error occurred';
      mockTaskService.getAllProjectTasks.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.findAll(req, res,priority);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

});
