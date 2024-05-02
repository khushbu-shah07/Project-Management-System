import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { getMockReq, getMockRes } from '@jest-mock/express'
import { UserRole } from './dto/user.role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { ForbiddenException, HttpException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let userController: UsersController;

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

  const mockUser = {
    id: 1,
    name: "Test",
    email: "Test@gmail.com",
    password: "Test",
    role: UserRole.EMPLOYEE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  let mockUserService = {
    findAll: jest.fn().mockResolvedValue([mockUser]),
    create: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn().mockResolvedValue(mockUser),
    remove: jest.fn().mockResolvedValue({ affected: 1 }),
    update: jest.fn().mockResolvedValue(mockUser)
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      controllers: [UsersController],
      providers: [{
        provide: UsersService,
        useValue: mockUserService
      }],
    }).compile();

    userController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  // Test case for findAll Users
  describe('Get All Users', () => {
    it('should get all users', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'admin');
      const res = getMockResponse();
      await userController.findAll(req, res);
      expect(mockUserService.findAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get All User',
        status: 'success',
        data: [mockUser]
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('it should throw forbidden exception for non admin user', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'user');
      const res = getMockResponse();
      const errorMessage = "only admin has access"
      try {
        await userController.findAll(req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('it should throw http exception for any other errors', async () => {
      const req = getMockAuthentiatedRequest({}, 1, 'user');
      const res = getMockResponse();
      const errorMessage = 'Some error occurred';
      mockUserService.findAll.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await userController.findAll(req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  //Test case for create User
  describe('create User', () => {
    it('should create user and return it', async () => {
      const userData: CreateUserDto = mockUser
      const req = getMockAuthentiatedRequest(userData, 1, "admin")
      const res = getMockResponse()
      await userController.create(userData, req, res)
      expect(mockUserService.create).toHaveBeenCalledWith(userData)
      expect(res.json).toHaveBeenCalledWith({
        operation: "Create User",
        status: "success",
        data: mockUser
      })
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('should throw forbidden exception for non admin user', async () => {
      const userData: CreateUserDto = mockUser
      const req = getMockAuthentiatedRequest(userData, 1, "user")
      const res = getMockResponse()
      const errorMessage = "only admin has access"
      try {
        await userController.create(userData, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const userData: CreateUserDto = mockUser
      const req = getMockAuthentiatedRequest(userData, 1, "user")
      const res = getMockResponse()
      const errorMessage = 'Some error occurred';
      mockUserService.create.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await userController.create(userData, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  //Test Case for finone user
  describe('FindOne User', () => {
    it('should find a single user and return it if user exits', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "admin")
      const res = getMockResponse()
      const id = "1"
      await userController.findOne(id, req, res)
      expect(mockUserService.findOne).toHaveBeenCalledWith(+id)
      expect(res.json).toHaveBeenCalledWith({
        operation: "Get Single User",
        status: "success",
        data: mockUser
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should find user successfully for non-admin user if finding ownself', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const id = "1"
      await userController.findOne(id, req, res)
      expect(mockUserService.findOne).toHaveBeenCalledWith(+id)
      expect(res.json).toHaveBeenCalledWith({
        operation: "Get Single User",
        status: "success",
        data: mockUser
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw forbidden exception if non admin when other user try to fetch user', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = "Access Denied to Fetch Single User"
      try {
        await userController.findOne(id, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const userData: CreateUserDto = mockUser
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = 'Some error occurred';
      mockUserService.findOne.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await userController.findOne(id, req, res);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  //Test Case for remove User
  describe('Remove user', () => {
    it('should remove user if exists', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "admin")
      const res = getMockResponse()
      const id = "1"
      await userController.remove(req, res, id)
      expect(mockUserService.remove).toHaveBeenCalledWith(+id)
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Delete User',
        status: "success",
        data: { deletedUser: { affected: 1 } }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should remove user successfully for non admin user if user is deleting ownself', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const id = "1"
      await userController.remove(req, res, id)
      expect(mockUserService.remove).toHaveBeenCalledWith(+id)
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Delete User',
        status: "success",
        data: { deletedUser: { affected: 1 } }
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw forbidden exception if non admin user and when other user try to remove user', async () => {
      const req = getMockAuthentiatedRequest({}, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = "You Can Not Delete"
      try {
        await userController.remove(req, res, id)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const userData: CreateUserDto = mockUser
      const req = getMockAuthentiatedRequest(userData, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = 'Some error occurred';
      mockUserService.findOne.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await userController.remove(req, res, id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })

  })

  describe('update user', () => {
    it('should update the use and return it exists', async () => {
      const updateUserData: UpdateUserDto = mockUser
      const req = getMockAuthentiatedRequest(mockUser, 1, "admin")
      const res = getMockResponse()
      const id = "1"
      await userController.update(id, mockUser, req, res)
      expect(mockUserService.update).toHaveBeenCalledWith(+id, mockUser)
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Update User',
        status: "success",
        data: mockUser
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should update user successfully for non admin user if user is updating ownself', async () => {
      const updateUserData: UpdateUserDto = mockUser
      const req = getMockAuthentiatedRequest(mockUser, 1, "user")
      const res = getMockResponse()
      const id = "1"
      await userController.update(id, mockUser, req, res)
      expect(mockUserService.update).toHaveBeenCalledWith(+id, mockUser)
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Update User',
        status: "success",
        data: mockUser
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })

    it('should throw forbidden exception if non admin user and when other user try to update user', async () => {
      const updateUserData: UpdateUserDto = mockUser
      const req = getMockAuthentiatedRequest(mockUser, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = "Access Denied"
      try {
        await userController.update(id, updateUserData, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(403)
      }
    })

    it('should throw http exception for any other errors', async () => {
      const updateUserData: UpdateUserDto = mockUser
      const req = getMockAuthentiatedRequest(mockUser, 1, "user")
      const res = getMockResponse()
      const id = "1"
      const errorMessage = 'Some error occurred';
      mockUserService.update.mockRejectedValueOnce({ message: errorMessage, status: 400 });
      try {
        await userController.update(id, updateUserData, req, res)
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.getStatus()).toBe(400)
      }
    })
  })
})