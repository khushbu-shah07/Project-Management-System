import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { DepartmentUser } from './entities/department-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentUserDto } from './dto/create-department-user.dto';
import { httpStatusCodes } from 'utils/sendresponse';

@Injectable()
export class DepartmentService {

  constructor(@InjectRepository(Department) private readonly departmentRepository: Repository<Department>, @InjectRepository(DepartmentUser) private readonly departmentUserRepository: Repository<DepartmentUser>) { }

  async create(departmentData: CreateDepartmentDto): Promise<Department> {
    try {
      const department = await this.departmentRepository.create(departmentData as unknown as Department);
      await this.departmentRepository.save(department);
      return department;
    } catch (error) {
      if(error.constraint === "UQ_471da4b90e96c1ebe0af221e07b"){
        throw new ConflictException("Same name Department exists")
      } else {
        console.log(error)
        throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
      }

    }
  }

  async findAll(): Promise<Department[]> {
    try {
      const departments = await this.departmentRepository.find({select:{id:true,name:true,}});
      return departments;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findOne(id: number): Promise<Department> {
    try {
      const department = await this.departmentRepository.findOne({
        where: {
          id: id
        },
        select:{
          id:true,
          name:true,
        }
      })
      if (!department) throw new NotFoundException('Department with given id does not exists');
      return department;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findByName(name: string): Promise<Department> {
    try {
      const department = await this.departmentRepository.findOne({
        where: {
          name: name
        },
        select:{
          id:true,
          name:true,
        }
      })
      if (!department) throw new NotFoundException('Department with given name does not exists');
      return department;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async update(id: number, departmentData: UpdateDepartmentDto) {
    try {
      const department = await this.departmentRepository.update({ id }, departmentData)
      if (department.affected === 0) throw new NotFoundException('Department with given id does not exists');
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async remove(id: number) {
    try {
      const data = await this.departmentRepository.softDelete({ id })
      if (data.affected === 0) throw new NotFoundException('Department with given id does not exists');
      return { message: 'Department with given id deleted' };
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findUserInDepartment(department_id: number, user_id: number): Promise<number> {
    try {
      const departmentUser = await this.departmentUserRepository
        .createQueryBuilder('du')
        .where('du.department_id = :departmentId', { departmentId: department_id })
        .andWhere('du.user_id = :userId', { userId: user_id })
        .getCount()
      return departmentUser;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async addUserToDepartment(departmentUserData: CreateDepartmentUserDto): Promise<DepartmentUser> {
    try {
      const isExists = await this.findUserInDepartment(departmentUserData.department_id, departmentUserData.user_id);
      if (isExists > 0) throw new BadRequestException('User already exists in this departmnet');
      const departmentUser = await this.departmentUserRepository.create(departmentUserData as unknown as DepartmentUser)
      await this.departmentUserRepository.save(departmentUser)
      return departmentUser;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async removeFromDepartment(departmentUserData: CreateDepartmentUserDto) {
    try {
      const result = await this.departmentUserRepository
        .createQueryBuilder('')
        .delete()
        .where('department_id = :departmentId', { departmentId: departmentUserData.department_id })
        .andWhere('user_id = :userId', { userId: departmentUserData.user_id })
        .execute()
      if (result.affected === 0) throw new BadRequestException('User does not exists in this department')
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }

  async findDepartmentUsers(department_id: number): Promise<DepartmentUser[]> {
    try {
      const departmentUsers = await this.departmentUserRepository.find({
        where: {
          department_id: { id: department_id }
        }
      })
      return departmentUsers;
    } catch (error) {
      throw new HttpException(error.message, error.status || httpStatusCodes['Bad Request'])
    }
  }
}
