import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { getMockReq, getMockRes } from '@jest-mock/express'
import { HttpException } from '@nestjs/common';

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

// Always authorize for the sake of testing
jest.mock('../auth/Guards/auth.guard', () => ({
  ProjectManagerGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true)
  })),
  AdminGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true)
  })),
  AdminProjectGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true)
  })),
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true)
  })),
}));


describe('<-- ProjectController -->', () => {
  let controller: ProjectController;
  let mockProjectService;

  beforeEach(async () => {
    mockProjectService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      completeProject: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectController],
      providers: [{
        provide: ProjectService,
        useValue: mockProjectService
      }],
    }).compile();

    controller = module.get<ProjectController>(ProjectController);
  });

  describe('create', () => {
    it('should create a project', async () => {
      const projectData: CreateProjectDto = {
        name: 'Test project',
        description: 'test description',
        startDate: new Date(),
        expectedEndDate: new Date(),
        clientEmail: 'client@gmail.com',
        pm_id: 1
      }

      const req = getMockAuthentiatedRequest(projectData, 1, 'pm')
      const res = getMockResponse()

      const expectedResult = projectData;

      mockProjectService.create.mockResolvedValue(expectedResult);

      await controller.create(projectData, req, res);

      expect(mockProjectService.create).toHaveBeenCalledWith(projectData);
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Create project',
        status: 'success',
        data: expectedResult
      })
    })

    it('should throw a httpExpection if the request user id is not same as pm id in body', async () => {
      const projectData: CreateProjectDto = {
        name: 'Test project',
        description: 'test description',
        startDate: new Date(),
        expectedEndDate: new Date(),
        clientEmail: 'client@gmail.com',
        pm_id: 2 // different pm id 
      }

      const req = getMockAuthentiatedRequest(projectData, 1, 'pm')
      const res = getMockResponse()

      await expect(controller.create(projectData, req, res)).rejects.toThrow(HttpException);

      expect(mockProjectService.create).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      const projectData: CreateProjectDto = {
        name: 'Test project',
        description: 'test description',
        startDate: new Date(),
        expectedEndDate: new Date(),
        clientEmail: 'client@gmail.com',
        pm_id: 1
      }

      const req = getMockAuthentiatedRequest(projectData, 1, 'pm')
      const res = getMockResponse()

      const error = new Error('Project service error');
      mockProjectService.create.mockRejectedValue(error);

      await expect(controller.create(projectData, req, res)).rejects.toThrow(HttpException);

      expect(mockProjectService.create).toHaveBeenCalledWith(projectData);
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe('findAll', () => {
    it('should return all projects', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const expectedResult = [
        {
          name: 'test project 1',
          pm_id: 1
        },
        {
          name: 'test project 2',
          pm_id: 2
        }
      ]

      mockProjectService.findAll.mockResolvedValue(expectedResult);

      await controller.findAll(req, res);
      expect(mockProjectService.findAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get All Projects',
        status: 'success',
        data: expectedResult
      })
    })

    it('should handle service errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();

      const error = new Error('Project service error');
      mockProjectService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(req, res)).rejects.toThrow(HttpException);

      expect(mockProjectService.findAll).toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled();
    })
  })

  describe('findOne', () => {
    it('should return a project if exists', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 1;

      const expectedResult = {
        id: 1,
        name: 'test project',
        description: 'test description',
        pm_id: {
          id: 1,
          name: 'test pm'
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedResult);

      await controller.findOne(projectId.toString(), req, res);

      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get project by id',
        status: 'success',
        data: expectedResult
      })
    })

    it('should throw a httpException if project does not exists', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 12;

      mockProjectService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should throw a httpException if request user is pm and its id is not same as pm id of requested project', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 5;

      const expectedResult = {
        id: 5,
        name: 'test project',
        description: 'test description',
        pm_id: {
          id: 2, // not same id as the request user's id
          name: 'test pm'
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedResult);

      await expect(controller.findOne(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should return a project of with any pm id if the request user is admin', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      const projectId = 5;

      const expectedResult = {
        id: 5,
        name: 'test project',
        description: 'test description',
        pm_id: {
          id: 2, // not same id as the request user's id
          name: 'test pm'
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedResult);

      await controller.findOne(projectId.toString(), req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get project by id',
        status: 'success',
        data: expectedResult
      })
    })
  })

  describe('update', () => {
    it('should update the project if exists', async () => {
      const dataToUpdate = {
        name: "Updated name",
        description: "Updated description"
      }
      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 1
        }
      }
      const req = getMockAuthentiatedRequest(dataToUpdate, 1, 'pm')
      const res = getMockResponse();
      const projectId = 1;

      mockProjectService.findOne.mockResolvedValue(expectedProject)

      await controller.update(projectId.toString(), dataToUpdate, req, res)

      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.update).toHaveBeenCalledWith(projectId, dataToUpdate);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Update Project',
        data: null
      })
    })

    it('should throw a httpException if project does not exsits', async () => {
      const dataToUpdate = {
        name: "Updated name",
        description: "Updated description"
      }
      const req = getMockAuthentiatedRequest(dataToUpdate, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      mockProjectService.findOne.mockResolvedValue(null);

      await expect(controller.update(projectId.toString(), dataToUpdate, req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.update).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should throw a httpException if request user is pm and its id is not same as pm id of requested project to update', async () => {
      const dataToUpdate = {
        name: "Updated name",
        description: "Updated description"
      }
      const req = getMockAuthentiatedRequest(dataToUpdate, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await expect(controller.update(projectId.toString(), dataToUpdate, req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.update).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should update the project with any pm id if requested user is admin', async () => {
      const dataToUpdate = {
        name: "Updated name",
        description: "Updated description"
      }
      const req = getMockAuthentiatedRequest(dataToUpdate, 1, 'admin');
      const res = getMockResponse()

      const projectId = 10;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await controller.update(projectId.toString(), dataToUpdate, req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.update).toHaveBeenCalledWith(projectId, dataToUpdate);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Update Project',
        data: null
      })
    })

    it('should handle service errors', async () => {
      const dataToUpdate = {
        name: "Updated name",
        description: "Updated description"
      }
      const req = getMockAuthentiatedRequest(dataToUpdate, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      const error = new Error('Project service error')

      mockProjectService.findOne.mockRejectedValue(error);

      await expect(controller.update(projectId.toString(), dataToUpdate, req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.update).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('should delete the project if exists', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 1;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 1
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await controller.remove(projectId.toString(), req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.remove).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Delete project',
        data: null
      })
    })

    it('should throw a httpException if project does not exists', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 5;

      mockProjectService.findOne.mockResolvedValue(null);

      await expect(controller.remove(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.remove).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalledWith();
    })

    it('should throw a httpException if the request user is pm and its id is not same as pm id of project requested to delete', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const projectId = 2;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await expect(controller.remove(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.remove).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should delete the project of with any pm id if the request user is admin', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      const projectId = 1;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);
      await controller.remove(projectId.toString(), req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.remove).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Delete project',
        data: null
      })
    })
  })

  describe('complete project', () => {
    it('should complete the project if exists', async () => {
      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 1
        }
      }
      const req = getMockAuthentiatedRequest({}, 1, 'pm')
      const res = getMockResponse();
      const projectId = 1;

      mockProjectService.findOne.mockResolvedValue(expectedProject)

      await controller.completeProject(projectId.toString(), req, res)

      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.completeProject).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Complete project',
        data: null
      })
    })

    it('should throw a httpException if project does not exsits', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      mockProjectService.findOne.mockResolvedValue(null);

      await expect(controller.completeProject(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.completeProject).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should throw a httpException if request user is pm and its id is not same as pm id of requested project to complete', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await expect(controller.completeProject(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.completeProject).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    })

    it('should complete the project with any pm id if requested user is admin', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse()

      const projectId = 10;

      const expectedProject = {
        name: 'test name',
        description: 'test description',
        pm_id: {
          id: 2 // not same as request user id
        }
      }

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await controller.completeProject(projectId.toString(), req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.completeProject).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        operation: 'Complete project',
        data: null
      })
    })

    it('should handle service errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse()

      const projectId = 10;

      const error = new Error('Project service error')

      mockProjectService.findOne.mockRejectedValue(error);

      await expect(controller.completeProject(projectId.toString(), req, res)).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockProjectService.completeProject).not.toHaveBeenCalledWith();
      expect(res.json).not.toHaveBeenCalled()
    })
  })
});
