import { Test, TestingModule } from '@nestjs/testing';
import { UserprojectController } from './userproject.controller';
import { UserprojectService } from './userproject.service';
import { getMockReq, getMockRes } from '@jest-mock/express';
import { CreateUserprojectDto } from './dto/create-userproject.dto';
import { UsersService } from 'src/users/users.service';
import { ProjectService } from 'src/project/project.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpException } from '@nestjs/common';
// import { User } from 'src/users/entities/user.entity';
// import { Project } from 'src/project/entities/project.entity';

const getMockResponse = () => {
  const mockResponse = getMockRes();
  return mockResponse.res;
};

const getMockAuthentiatedRequest = (
  body: any,
  userId: number,
  role: string,
) => {
  const mockRequest = getMockReq({
    body: body,
    user: {
      id: userId,
      role: role,
    },
  });
  return mockRequest;
};

// Always authorize for the sake of testing
// jest.mock('../auth/Guards/auth.guard', () => ({
//   ProjectManagerGuard: jest.fn().mockImplementation(() => ({
//     canActivate: jest.fn(() => true),
//   })),
//   AdminGuard: jest.fn().mockImplementation(() => ({
//     canActivate: jest.fn(() => true),
//   })),
//   AdminProjectGuard: jest.fn().mockImplementation(() => ({
//     canActivate: jest.fn(() => true),
//   })),
//   AuthGuard: jest.fn().mockImplementation(() => ({
//     canActivate: jest.fn(() => true),
//   })),
// }));

describe('UserprojectController', () => {
  let controller: UserprojectController;
  let mockUserProjectService;
  let mockUsersService;
  let mockProjectService;

  let mockUserProject = {
    user_id: 1,
    project_id: 4,
  };

  beforeEach(async () => {
    mockUserProjectService = {
      getUserbyProjectId: jest.fn(),
      getProjectsByUserId: jest.fn(),
      create: jest.fn(),
      removeUserFromProject: jest.fn(),
      getUsersFromProject: jest.fn(),
    };

    mockUsersService = {
      findOne: jest.fn(),
    };

    mockProjectService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserprojectController],
      providers: [
        {
          provide: UserprojectService,
          useValue: mockUserProjectService,
        },
        {
          provide: ProjectService,
          useValue: mockProjectService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
      imports: [JwtModule],
    }).compile();

    controller = module.get<UserprojectController>(UserprojectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // describe('Create UserProject (Add user in the project)', () => {
  //   it('should create userproject and return it', async () => {
  //     const userProjectData: CreateUserprojectDto = mockUserProject;

  //     const req = getMockAuthentiatedRequest(userProjectData, 1, 'employee');
  //     const res = getMockResponse();

  //     const expectedResult = userProjectData;
  //     mockUserProjectService.create.mockResolvedValue(expectedResult);

  //     await controller.create(userProjectData, req, res);

  //     expect(controller.create).toHaveBeenCalledWith(userProjectData);
  //     expect(res.json).toHaveBeenCalledWith({
  //       operation: 'User Added to project',
  //       status: 'success',
  //       data: expectedResult,
  //     });
  //     expect(res.status).toHaveBeenCalledWith(201);
  //   });

  //   it('should throw forbidden error if the req.user.role===employee');
  //   const userProjectData: CreateUserprojectDto = mockUserProject;

  //   const req = getMockAuthentiatedRequest(userProjectData, 1, 'employee');
  //   const res = getMockResponse();

  //   expect(controller.create).not.toHaveBeenCalled();
  //   expect(res.json).not.toHaveBeenCalled();
  // });

  describe('getUserbyProjectId', () => {
    it('should return all the users in project if requested user is pm', async () => {
      const projectId = 1;

      const expectedProject = {
        name: 'test project 1',
        pm_id: {
          id: 3,
          name: 'pm name',
        },
      };

      const expectedResult = [
        {
          id: 1,
          user_detail: {
            id: 24,
            name: 'user name 1',
          },
        },
        {
          id: 2,
          user_detail: {
            id: 25,
            name: 'user name 2',
          },
        },
      ];

      const req = getMockAuthentiatedRequest(null, 3, 'pm');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);
      mockUserProjectService.getUsersFromProject.mockResolvedValue(
        expectedResult,
      );

      await controller.getUserbyProjectId(projectId, req, res);

      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get all users of the project',
        status: 'success',
        data: expectedResult,
      });
    });

    it('should throw a httpException if project does not exists', async () => {
      const projectId = 1;

      const expectedProject = null;

      const req = getMockAuthentiatedRequest(null, 3, 'pm');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await expect(
        controller.getUserbyProjectId(projectId, req, res),
      ).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockUserProjectService.getUsersFromProject).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should throw a httpException if requested user is pm but the req pms id and project pm id', async () => {
      const projectId = 1;

      const expectedProject = {
        name: 'test project 1',
        pm_id: {
          id: 2,
          name: 'pm name',
        },
      };

      const req = getMockAuthentiatedRequest(null, 3, 'pm');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);

      await expect(
        controller.getUserbyProjectId(projectId, req, res),
      ).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockUserProjectService.getUsersFromProject).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should throw a httpException if requested user role is employee and is part of project', async () => {
      const projectId = 1;

      const expectedProject = {
        name: 'test project 1',
        pm_id: {
          id: 2,
          name: 'pm name',
        },
      };

      const expectedResult = [
        {
          id: 1,
          user_detail: {
            user_id: 24,
            name: 'user name 1',
          },
        },
        {
          id: 2,
          user_detail: {
            user_id: 4,
            name: 'user name 2',
          },
        },
      ];

      const req = getMockAuthentiatedRequest(null, 4, 'employee');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);
      mockUserProjectService.getUsersFromProject.mockResolvedValue(
        expectedResult,
      );

      await controller.getUserbyProjectId(projectId, req, res);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockUserProjectService.getUsersFromProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get all users of the project',
        status: 'success',
        data: expectedResult,
      });
    });

    it('should throw a httpException if requested user role is employee and is not part of project', async () => {
      const projectId = 1;

      const expectedProject = {
        name: 'test project 1',
        pm_id: {
          id: 2,
          name: 'pm name',
        },
      };

      const expectedResult = [
        {
          id: 1,
          user_detail: {
            user_id: 24,
            name: 'user name 1',
          },
        },
        {
          id: 2,
          user_detail: {
            user_id: 23,
            name: 'user name 2',
          },
        },
      ];

      const req = getMockAuthentiatedRequest(null, 4, 'employee');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);
      mockUserProjectService.getUsersFromProject.mockResolvedValue(
        expectedResult,
      );

      await expect(
        controller.getUserbyProjectId(projectId, req, res),
      ).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockUserProjectService.getUsersFromProject).toHaveBeenCalledWith(
        projectId,
      );
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return all the users in project if requested user is admin', async () => {
      const projectId = 1;

      const expectedProject = {
        name: 'test project 1',
        pm_id: {
          id: 3,
          name: 'pm name',
        },
      };

      const expectedResult = [
        {
          id: 1,
          user_detail: {
            id: 24,
            name: 'user name 1',
          },
        },
        {
          id: 2,
          user_detail: {
            id: 25,
            name: 'user name 2',
          },
        },
      ];

      const req = getMockAuthentiatedRequest(null, 10, 'admin');
      const res = getMockResponse();

      mockProjectService.findOne.mockResolvedValue(expectedProject);
      mockUserProjectService.getUsersFromProject.mockResolvedValue(
        expectedResult,
      );

      await controller.getUserbyProjectId(projectId, req, res);

      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get all users of the project',
        status: 'success',
        data: expectedResult,
      });
    });

    it('should handle service errors', async () => {
      const projectId = 1;
      const error = new Error('userproject service error');

      mockProjectService.findOne.mockRejectedValue(error);

      const req = getMockAuthentiatedRequest(null, 1, 'pm');
      const res = getMockResponse();

      await expect(
        controller.getUserbyProjectId(projectId, req, res),
      ).rejects.toThrow(HttpException);
      expect(mockProjectService.findOne).toHaveBeenCalledWith(projectId);
      expect(mockUserProjectService.getUsersFromProject).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
