import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtModule } from '@nestjs/jwt';
import { getMockReq, getMockRes } from '@jest-mock/express'
import { UserRole } from './dto/user.role.enum';

describe('UsersController', () => {
  let userController: UsersController;
  let userService : UsersService

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
    id:1,
    name:"Test",
    email:"Test@gmail.com",
    password:"Test",
    role:UserRole.EMPLOYEE,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  }

  let mockUserService = {
    findAll :jest.fn().mockResolvedValue([mockUser])
  }


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[JwtModule],
      controllers: [UsersController],
      providers: [{
        provide:UsersService,
        useValue:mockUserService
      }],  
    }).compile();

    userService = module.get<UsersService>(UsersService);
    userController = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('Get All Books',()=>{
    it('should get all books',async()=>{
      const req = getMockAuthentiatedRequest({}, 1, 'pm');
      const res = getMockResponse();
      const result = await userController.findAll(req,res);
      expect (mockUserService.findAll).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        operation: 'Get All User',
        status: 'success',
        data: [mockUser]
      })
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

});
