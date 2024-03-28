import { BadGatewayException, BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthGuard } from 'src/auth/auth.guard';
import { AdminGuard } from './role-guard/admin.guard';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository:Repository<User>){}

  private async hashPassword(password: string): Promise<string> {
    const Rounds = 10;
    const hash = await bcrypt.hash(password, Rounds);
    return hash;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { name, email, role } = createUserDto;
      const password = await this.hashPassword(createUserDto.password);
      const user = this.userRepository.create({ name, email, password, role });
      await this.userRepository.save(user);
      delete user.password; 
      return user;
    } catch (error) {
      throw new BadRequestException(error.message);
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
      if(user === null || user === undefined){
        throw new BadRequestException("No User With the given ID")
      }
      return user
    } catch (error) {
      throw new BadRequestException(error.message)
    };
  }

  async findByEmail(email:string):Promise<User>{
    try {
      const user = await this.userRepository.findOne({where:{email:email}})
      return user
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto):Promise<User> {
   try {
    if(updateUserDto.password!==undefined){
      const password = await this.hashPassword(updateUserDto.password);
      updateUserDto.password = password
    }
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
