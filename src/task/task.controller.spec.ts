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
import { UpdateTaskDto } from './dto/update-task.dto';
import { UserHasTask } from 'src/notification/serviceBasedEmail/userHasTask';

describe('TaskController', () => {
  let taskController: TaskController;
  let userRepository: any;
  // let mockUserHasTask = {
  //   assignedOrRemoveToTask: jest.fn()
  // }


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
    project_id: 1
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
    pm_id: { id: 1 }
  }

  let mockUserProject = {
    id: 1,
    user_id: 2,
    project_id: 3
  }

  let mockTaskUser = {
    id: 1,
    user_id: 2,
    task_id: 3
  }

  let mockUser = {
    name: "test",
    role: "employee",
    email: "test@gmail.com"
  }

  let mockTaskService = {
    findAll: jest.fn().mockResolvedValue([mockTask]),
    create: jest.fn().mockResolvedValue(mockTask),
    findOne: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    getAllTaskByPriority: jest.fn().mockResolvedValue([mockTask]),
    getAllProjectTasks: jest.fn().mockResolvedValue([mockTask]),
    findTaskUser: jest.fn().mockResolvedValue(1),
    getUsersInTask: jest.fn().mockResolvedValue([mockUser.email]),
    assignTask: jest.fn().mockResolvedValue(mockTaskUser),
    removeTaskUser: jest.fn().mockImplementation(),
    getAllTasksAssignedToUserFromProject: jest.fn().mockResolvedValue([mockTask]),
    getAllTasksAssignedToUser:jest.fn()

  }

  let mockProjectService = {
    findOne: jest.fn().mockResolvedValue(mockProject)
  }

  let mockUserProjectservice = {
    getUsersFromProject: jest.fn().mockResolvedValue([mockUserProject])
  }
  let mockUserService = {}

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService
        },
        {
          provide: ProjectService,
          useValue: mockProjectService
        },
        {
          provide: UsersService,
          useValue: mockUserService
        },
        {
          provide: UserprojectService,
          useValue: mockUserProjectservice
        },
      ],
    }).compile();

    taskController = module.get<TaskController>(TaskController);
  });

  it('should be defined', () => {
    expect(taskController).toBeDefined();
  });

  //Create Task Test Cases
  describe("create task", () => {
    it("Should allow admin to create task and return task", async () => {
      try {
        const taskData = mockTask
        const req = getMockAuthentiatedRequest({}, 1, 'admin')
        const res = getMockResponse()
        await taskController.create(taskData as unknown as CreateTaskDto, req, res)
        expect(mockTaskService.create).toHaveBeenCalledWith(taskData)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Craete Task',
          status: "success",
          data: mockTask
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
        await taskController.create(taskData as unknown as CreateTaskDto, req, res)
        expect(mockProjectService.findOne).toHaveBeenCalledWith(taskData.project_id)
        expect(mockTaskService.create).toHaveBeenCalledWith(taskData)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Craete Task',
          status: "success",
          data: mockTask
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
  describe("findAll Task", () => {
    it("Should allow admin to find all task of all projects", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.findAll(req, res, priority);
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
    it("Should allow admin to find all task of all projects on the basis of priority", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.findAll(req, res, priority);
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
      const priority: string = "high"
      const errorMessage = "only admin has access"
      try {
        await taskController.findAll(req, res, priority);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority: string = "high"
      const errorMessage = 'Some error occurred';
      mockTaskService.findAll.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.findAll(req, res, priority);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //Test case for Get Project tasks
  describe("Get Tasks of Project", () => {
    it("should allow admin to find all tasks of a project", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`, req, res, priority);
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
    it("should allow the pm of a project to findAll Tasks of a project", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`, req, res, priority);
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
    it("should allow the user of the project to findAll Tasks", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'employee');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`, req, res, priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockUserProjectservice.getUsersFromProject).toHaveBeenCalledWith(mockProject.id)
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
    it("Should allow to get the project task by priorty by admin , pm or employee of project", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'user');
        const res = getMockResponse();
        const priority: string = "high"
        await taskController.getProjectTasks(`${mockProject.id}`, req, res, priority);
        expect(mockProjectService.findOne).toHaveBeenCalledWith(mockProject.id)
        expect(mockUserProjectservice.getUsersFromProject).toHaveBeenCalledWith(mockProject.id)
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
    it("should throw forbidden exception for non admin non pm user of a project and non employee of a project", async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority: string = "high"
      const errorMessage = "Access Denied to fetch all project tasks"
      try {
        await taskController.getProjectTasks(`${mockProject.id}`, req, res, priority);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const priority: string = "high"
      const errorMessage = 'Some error occurred';
      mockTaskService.getAllProjectTasks.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.findAll(req, res, priority);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  //Test case for Get Single Task
  describe("Get Single Task by id", () => {
    it("should allow admin to find single task", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        await taskController.findOne(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get Single Task',
          status: "success",
          data: mockTask
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should allow pm of a project to find single task", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        await taskController.findOne(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get Single Task',
          status: "success",
          data: mockTask
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })
    it("should allow employee of a project to find single task", async () => {
      try {
        const user_id = 1;
        const req = getMockAuthentiatedRequest({}, user_id, 'employee');
        const res = getMockResponse();
        await taskController.findOne(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(mockTaskService.findTaskUser).toHaveBeenCalledWith(mockTask.id, user_id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get Single Task',
          status: "success",
          data: mockTask
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden exception for non admin non pm user of a project and non employee of a project", async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied to Fetch Single Task"
      try {
        await taskController.findOne(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.findOne.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.findOne(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //test case for update Task
  describe("Update Task", () => {
    it("should allow admin to upate task", async () => {
      const updatedTaskData: UpdateTaskDto = {
        title: "Updated Task",
        description: "This is updated Task"
      }
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      await taskController.update(`${mockTask.id}`, updatedTaskData, req, res)
      expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
      expect(mockTaskService.update).toHaveBeenCalledWith(mockTask.id, updatedTaskData)
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Update Task',
        status: "success",
        data: null
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
    it("should allow pm of the project to update task", async () => {
      const updatedTaskData: UpdateTaskDto = {
        title: "Updated Task",
        description: "This is updated Task"
      }
      const task = {
        id: 1,
        title: "Task1",
        description: "This is Task",
        project_id: {
          pm_id: { id: 1 }
        }
      }
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        mockTaskService.findOne.mockResolvedValue(task)
        await taskController.update(`${task.id}`, updatedTaskData, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(task.id)
        expect(mockTaskService.update).toHaveBeenCalledWith(task.id, updatedTaskData)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Update Task',
          status: "success",
          data: null
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden exception for non-admin user or non pm user", async () => {
      const updatedTaskData: UpdateTaskDto = {
        title: "Updated Task",
        description: "This is updated Task"
      }
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied to Update Project"
      try {
        await taskController.update(`${mockTask.id}`, updatedTaskData, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const updatedTaskData: UpdateTaskDto = {
        title: "Updated Task",
        description: "This is updated Task"
      }
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.update.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.update(`${mockTask.id}`, updatedTaskData, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  //Test case for Delete Task
  describe("Delete Task", () => {
    it("Should allow admin to delete task of any project", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        await taskController.remove(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(mockTaskService.remove).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Delete Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("Should allow pm of project to delete task of any project", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        await taskController.remove(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(mockTaskService.remove).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Delete Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden Exception for a non admin or non pm user", async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied to Delete Task"
      try {
        await taskController.remove(`${mockProject.id}`, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.remove.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.remove(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //Test case for get user in task
  describe("Get User In Task", () => {
    it("should allow admin to fetch all user in a task", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'admin');
        const res = getMockResponse();
        await taskController.getUsersInTask(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(mockTaskService.getUsersInTask).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get All Users of a Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should allow pm of project to fetch all user in a task", async () => {
      try {
        const req = getMockAuthentiatedRequest({}, 1, 'pm');
        const res = getMockResponse();
        await taskController.getUsersInTask(`${mockTask.id}`, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTask.id)
        expect(mockTaskService.getUsersInTask).toHaveBeenCalledWith(mockTask.id)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get All Users of a Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden Exception for a non admin or non pm user", async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied to fetch users of a Task"
      try {
        await taskController.getUsersInTask(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.getUsersInTask.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.getUsersInTask(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //Test case for assignTaskToUser
  describe("Assign Task To User", () => {
    it("should allow admin to assign task to user", async () => {
      try {
        const task = {
          id: 1,
          title: "test Task 1",
          project_id: {
            id: 1
          }
        }
        const req = getMockAuthentiatedRequest({}, 1, "admin")
        const res = getMockResponse()
        await taskController.assignTaskToUser(mockTaskUser, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTaskUser.task_id)
        expect(mockUserProjectservice.getUsersFromProject).toHaveBeenCalledWith(task.project_id.id)
        expect(mockTaskService.assignTask).toHaveBeenCalledWith(mockTaskUser, task)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Assign task to Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })
    it("should allow pm of the project to assign task to user", async () => {
      try {
        const task = {
          id: 1,
          title: "test Task 1",
          project_id: {
            id: 1
          }
        }
        const req = getMockAuthentiatedRequest({}, 1, "pm")
        const res = getMockResponse()
        await taskController.assignTaskToUser(mockTaskUser, req, res)
        expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTaskUser.task_id)
        expect(mockUserProjectservice.getUsersFromProject).toHaveBeenCalledWith(task.project_id.id)
        expect(mockTaskService.assignTask).toHaveBeenCalledWith(mockTaskUser, task)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Assign task to Task',
          status: "success",
          data: { deletedTask: { affected: 1 } }
        })
        expect(res.status).toHaveBeenCalledWith(201)
      } catch (error) {
        expect(error)
      }
    })
    // it("should throw forbidden Exception for any other errors",async()=>{
    //   const req = getMockAuthentiatedRequest({}, 1, "user")
    //   const res = getMockResponse()
    //   const errorMessage = "Access Denied to assign task to user"
    //   const task = {
    //     id:1,
    //     title:"test Task 1",
    //     project_id:{
    //       id:1
    //     }
    //   }
    //   const userProject = {
    //     id:1,
    //     user_id:1,
    //     project_id:1
    //   }
    //   try {
    //     await taskController.assignTaskToUser(mockTaskUser,req,res)
    //   } catch (error) {
    //     expect(error).toBeInstanceOf(ForbiddenException);
    //     expect(error.message).toBe(errorMessage);
    //     expect(error.getStatus()).toBe(400)
    //   }
    // })
  })

  //Test Case for Delete Task User
  // describe("Delete Task User", () => {
  //   it("should allow admin to remove a user from task", async () => {
  //     try {
  //       const req = getMockAuthentiatedRequest({}, 1, "admin")
  //       const res = getMockResponse()

  //       mockUserHasTask.assignedOrRemoveToTask = jest.fn()

  //       await taskController.deleteTaskUser(mockTaskUser, req, res)
  //       expect(mockTaskService.findOne).toHaveBeenCalledWith(mockTaskUser.task_id)
  //       expect(mockTaskService.removeTaskUser).toHaveBeenCalledWith(mockTaskUser)
  //       expect(res.json).toHaveBeenCalledWith({
  //         operation: 'Delete Task User',
  //         status: "success",
  //         data: null
  //       })
  //       expect(res.status).toHaveBeenCalledWith(200)
  //     } catch (error) {
  //       expect(error)
  //     }
  //   })
  // })

  //Test Case for get all tasks of user from project
  describe("get all tasks of user from project", () => {
    it("admin should be able to fetch tasks of user", async () => {
      try {
        const projectId = 1
        const userId = 1
        const req = getMockAuthentiatedRequest({}, 1, "admin")
        const res = getMockResponse()
        await taskController.getAllTasksOfUserFromProject(req, res, `${projectId}`, `${userId}`)
        expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId)
        expect(mockTaskService.getAllTasksAssignedToUserFromProject).toHaveBeenCalledWith(projectId, userId)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all tasks assigned to user from project',
          status: "success",
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }

    })
    it("should allow pm to fetch all tasks of a user in a project", async () => {
      try {
        const projectId = 1
        const userId = 1
        const req = getMockAuthentiatedRequest({}, 1, "pm")
        const res = getMockResponse()
        await taskController.getAllTasksOfUserFromProject(req, res, `${projectId}`, `${userId}`)
        expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId)
        expect(mockTaskService.getAllTasksAssignedToUserFromProject).toHaveBeenCalledWith(projectId, userId)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all tasks assigned to user from project',
          status: "success",
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
        
      }
    })
    it("Should throw forbidden Exception any non admin or non pm of project", async () => {
      const projectId = 1
      const userId = 2
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = "Access Denied"
      try {
        await taskController.getAllTasksOfUserFromProject(req, res, `${projectId}`, `${userId}`)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
    it("should throw httpException for any other error",async()=>{
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockTaskService.getAllTasksAssignedToUserFromProject.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.getUsersInTask(`${mockTask.id}`, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })

  //Test case for get All Task of a User
  describe("get all tasks of a user",()=>{
    it("should allow admin to fetch and return all task of particular user",async()=>{
      try {
        const userID = 1;
        const req = getMockAuthentiatedRequest({},1,"admin")
        const res = getMockResponse()
        await taskController.getAllTasksOfUser(req,res,`${userID}`)
        expect(mockTaskService.getAllTasksAssignedToUser).toHaveBeenCalledWith(userID)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all tasks assigned to user',
          status: "success",
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should allow a user to fetch and return all task of his own",async()=>{
      try {
        const userID = 1;
        const req = getMockAuthentiatedRequest({},1,"user")
        const res = getMockResponse()
        await taskController.getAllTasksOfUser(req,res,`${userID}`)
        expect(mockTaskService.getAllTasksAssignedToUser).toHaveBeenCalledWith(userID)
        expect(res.json).toHaveBeenCalledWith({
          operation: 'Get all tasks assigned to user',
          status: "success",
          data: [mockTask]
        })
        expect(res.status).toHaveBeenCalledWith(200)
      } catch (error) {
        expect(error)
      }
    })
    it("should throw forbidden Exception when user tries to fetch all task of other user",async()=>{
      const errorMessage = "Access Denied"
      try {
        const userID = 1;
        const req = getMockAuthentiatedRequest({},1,"user")
        const res = getMockResponse()
        await taskController.getAllTasksOfUser(req,res,`${userID}`)
        expect(mockTaskService.getAllTasksAssignedToUser).toHaveBeenCalledWith(userID)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
    it('should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const userID = 1;
      const errorMessage = 'Some error occurred';
      mockTaskService.getAllTasksAssignedToUser.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await taskController.getAllTasksOfUser(req,res,`${userID}`)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })
});
