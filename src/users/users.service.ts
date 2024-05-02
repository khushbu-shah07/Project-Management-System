import {BadRequestException, ConflictException, HttpException, Injectable, NotFoundException} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { httpStatusCodes } from '../../utils/sendresponse';

@Injectable()
export class UsersService {

  constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

  public async hashPassword(password: string): Promise<string> {
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
      delete user.password
      return user;
    } catch (error) {
      if(error.constraint === 'IDX_e12875dfb3b1d92d7d7c5377e2'){
        throw new ConflictException("Enter Unique Email .")
      } else { 
        throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
      }
    }
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({select:{id:true,name:true,email:true,role:true}})
      return users;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id: id },select:{name:true,email:true,role:true} })
      if (!user) {
        throw new NotFoundException("No User With the given ID")
      }
      return user
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Not Found'])
    };
  }

  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email: email }, select: { password: true, role: true, id: true } })
      return user
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      if (updateUserDto.password !== undefined) {
        const password = await this.hashPassword(updateUserDto.password);
        updateUserDto.password = password
      }
      const update = await this.userRepository.update({ id }, updateUserDto);
      if (update.affected === 0) {
        throw new NotFoundException('No User With The given ID');
      }
      const user = await this.userRepository.findOneBy({ id });
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async remove(id: number): Promise<Number> {
    try {
      const deleted = await this.userRepository.softDelete({ id });
      if (deleted.affected === 0) {
        throw new NotFoundException("No User With The Given ID")
      }
      return deleted.affected
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
