import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository:Repository<User>){}

  async create(createUserDto: CreateUserDto):Promise<User> {
    try {
      const user = this.userRepository.create(createUserDto)
      await this.userRepository.save(user)
      return user
    } catch (error) {
      throw new BadRequestException(error.message)
      
    }
  }

  async findAll() :Promise<User[]> {
    try {
      const users = await this.userRepository.find()
      return users;
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
