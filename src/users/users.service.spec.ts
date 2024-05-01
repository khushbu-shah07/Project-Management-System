import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { UserRole } from './dto/user.role.enum';
import exp from 'constants';
import { mock } from 'node:test';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository:any
 

  const mockUser = {
    id:1,
    name:"Test",
    email:"Test@gmail.com",
    password:"Test",
    role:UserRole.EMPLOYEE,
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  }

  beforeEach(async () => {
    mockUserRepository = {
      find:jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softDelete: jest.fn(),
      update:jest.fn(),
      findOneBy:jest.fn()
    }
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    service.hashPassword = jest.fn().mockResolvedValue('hashedPassword')
  });

  //Test Case For FindOne
  describe('findOne', () => {

    it('should find a user and return it if it exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      const result = await service.findOne(mockUser.id)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({where:{id:mockUser.id}})
      expect(result).toEqual(mockUser)
    })

    it('should throw a httpException if no user is found', async () => {
      const id = 123
      mockUserRepository.findOne.mockReturnValue(undefined)
      await expect(service.findOne(id)).rejects.toThrow(HttpException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({where: { id:id } })
    })

    it('should handle errors from the repository', async () => {
      const id = 1;
      const errorMessage = 'Database connection failed';
      mockUserRepository.findOne.mockRejectedValue(new Error(errorMessage));
      await expect(service.findOne(id)).rejects.toThrow(HttpException);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: id } });
    });

  })

  // Test Case for findAll
  describe('findAll',()=>{

    it('should return all users',async()=>{
      mockUserRepository.find.mockResolvedValue([mockUser])
      const result = await service.findAll()
      expect(mockUserRepository.find).toHaveBeenCalled()
      expect(result).toEqual([mockUser])
    })

    it('should handle errors from the repository', async () => {
      const errorMessage = 'Database connection failed';
      mockUserRepository.find.mockRejectedValue(new Error(errorMessage));
      await expect(service.findAll()).rejects.toThrow(HttpException);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  })

  //Test case for Create User
  describe('create', () => {

    it('should create a user and return user', async () => {
      const userData = {
        "name": "Test User",
        "email": "test@gmail.com",
        "password": "test",
        "role": UserRole.ADMIN
      };
      
      mockUserRepository.create.mockReturnValue(userData);
      mockUserRepository.save.mockReturnValue(userData);
      const result = await service.create(userData)
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: 'hashedPassword',
        role: userData.role
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(userData)
      expect(result.password).toBeUndefined();
      expect(result).toEqual(userData)
    }); 


    it('should handle databse errors occurres while creating a user', async () => {
      const userData = {
        "name": "Test User",
        "email": "test@gmail.com",
        "password": "Test",
        "role": "admin"
      }
      
      const error = new Error('Databse Connection error')
      mockUserRepository.create.mockRejectedValue(error)
      await expect(service.create(userData as unknown as CreateUserDto)).rejects.toThrow(error)
    })
  })

  //Test Case for FindBy Email
  describe("find by email",()=>{
    it('should find a user by email and return if exits',async()=>{
      mockUserRepository.findOne.mockResolvedValue(mockUser)
      const result = await service.findByEmail(mockUser.email)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({where:{email:mockUser.email},select: { password: true, role: true, id: true }})
      expect(result).toEqual(mockUser)
    })

    it('should handle database error',async()=>{
      const email = "error@gmail.com"
      const errorMessage = 'Database connection failed';
      mockUserRepository.findOne.mockRejectedValue(new Error(errorMessage))
      await expect(service.findByEmail(email)).rejects.toThrow(HttpException)
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({where:{email:email},select: { password: true, role: true, id: true }})
    })
  })

  describe('delete User',()=>{
    it('should remove the user if exits',async()=>{
      mockUserRepository.softDelete.mockResolvedValue({affected:1})
      const result = await service.remove(mockUser.id)
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith({id:mockUser.id})
      expect(result).toBe(1)
    })

    it('should throw httpException if user is not found',async()=>{
      const id = 444
      mockUserRepository.softDelete.mockResolvedValue({affected:0})
      await expect(service.remove(id)).rejects.toThrow(HttpException)
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith({id})
    })

    it('should handle database error',async()=>{
      const id = 111
      const error = new Error('Databse Connection error')
      mockUserRepository.softDelete.mockRejectedValue(error)
      await expect(service.remove(id)).rejects.toThrow(error)
      expect(mockUserRepository.softDelete).toHaveBeenCalledWith({id})
    })
  })  

  describe('update User',()=>{
    it("should update the user nad return it",async()=>{
      const updateUserData = {
        name:"Updated Name",
        email:"updated@gmail.com",
        password:"updated password"
      }
      const expectedResult = {
        name:"Updated Name",
        email:"updated email",
        password:"hashed Password"
      }
      mockUserRepository.update.mockResolvedValue({affected:1})
      mockUserRepository.findOneBy.mockResolvedValue(expectedResult)
      const result = await service.update(mockUser.id,updateUserData)
      expect(mockUserRepository.update).toHaveBeenCalledWith({id:mockUser.id},updateUserData)
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({id:mockUser.id})
      expect(result).toEqual(expectedResult)
    })

    it("should throw HttpException if user is not found",async()=>{
      const id = 1;
      const updateUserData = {
        name:"Updated Name",
        email:"updated@gmail.com",
        password:"updated password"
      };
      mockUserRepository.update.mockResolvedValue({affected:0})
      await expect(service.update(id,updateUserData)).rejects.toThrow(HttpException)
      expect(mockUserRepository.update).toHaveBeenCalledWith({id:mockUser.id},updateUserData)
    })

    it("Should handle database error",async()=>{
      const id = 111
      const updateUserData = {
        name:"Updated Name",
        email:"updated@gmail.com",
        password:"updated password"
      };
      const error = new Error('Databse Connection error')
      mockUserRepository.update.mockRejectedValue(error)
      await expect(service.update(id,updateUserData)).rejects.toThrow(HttpException)
      expect(mockUserRepository.update).toHaveBeenCalledWith({id},updateUserData)
    })
  })


});
