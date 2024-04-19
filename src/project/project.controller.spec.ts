import { Test, TestingModule } from '@nestjs/testing';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { getMockReq, getMockRes } from '@jest-mock/express'
import { httpStatusCodes } from '../../utils/sendresponse';

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

jest.mock('../auth/Guards/auth.guard', () => ({
  ProjectManagerGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true) // Always authorize for the sake of testing
  })),
  AdminGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true) // Always authorize for the sake of testing
  })),
  AdminProjectGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true) // Always authorize for the sake of testing
  })),
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn(() => true) // Always authorize for the sake of testing
  })),
}));


describe('<-- ProjectController -->', () => {
  let controller: ProjectController;
  let mockProjectService;

  beforeEach(async () => {
    mockProjectService = {
      create: jest.fn()
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
  })
});
