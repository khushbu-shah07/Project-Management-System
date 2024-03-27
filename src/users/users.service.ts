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

  async findOne(id: number) : Promise<User>{
    try {
      const user = await this.userRepository.findOne({where:{id:id}})
      return user
    } catch (error) {
      throw new BadRequestException(error.message)
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto):Promise<User> {
   try {
    const update = await this.userRepository.update({ id }, updateUserDto);
      if (update.affected === 0) {
        throw new BadRequestException('No User With The given ID');
      }
      const user = await this.userRepository.findOneBy({ id });
      return user;
   } catch (error) {
    throw new BadRequestException(error.message)
    
   }
  }

  async remove(id: number) :Promise<Number>{
    try {
      const deleted = await this.userRepository.delete({ id });
      if(deleted.affected === 0){
        throw new BadRequestException("No User With The Given ID")
      }
      return deleted.affected
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }
}
