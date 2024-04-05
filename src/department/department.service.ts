import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';
import { DepartmentUser } from './entities/department-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDepartmentUserDto } from './dto/create-department-user.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DepartmentService {

  constructor(@InjectRepository(Department) private readonly departmentRepository: Repository<Department>, @InjectRepository(DepartmentUser) private readonly departmentUserRepository: Repository<DepartmentUser>) { }

  async create(departmentData: CreateDepartmentDto) {
    try {
      const department = await this.departmentRepository.create(departmentData as unknown as Department);
      await this.departmentRepository.save(department);
      return department;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      const departments = await this.departmentRepository.find();
      return departments;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOne(id: number) {
    try {
      const department = await this.departmentRepository.findOne({
        where: {
          id: id
        }
      })
      if (!department) throw new Error('Department with given id does not exists');
      return department;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findByName(name: string) {
    try {
      const department = await this.departmentRepository.findOne({
        where: {
          name: name
        }
      })
      if (!department) throw new Error('Department with given name does not exists');
      return department;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async update(id: number, departmentData: UpdateDepartmentDto) {
    try {
      const department = await this.departmentRepository.update({ id }, departmentData)
      if (department.affected === 0) throw new Error('Department with given id does not exists');
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: number) {
    try {
      const data = await this.departmentRepository.softDelete({ id })
      if (data.affected === 0) throw new Error('Department with given id does not exists');
      return { message: 'Department with given id deleted' };
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async findUserInDepartment(department_id: number, user_id: number) {
    try {
      const departmentUser = await this.departmentUserRepository
        .createQueryBuilder('du')
        .where('du.department_id = :departmentId', { departmentId: department_id })
        .andWhere('du.user_id = :userId', { userId: user_id })
        .getCount()
      return departmentUser;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async addUserToDepartment(departmentUserData: CreateDepartmentUserDto) {
    try {
      const isExists = await this.findUserInDepartment(departmentUserData.department_id, departmentUserData.user_id);
      if (isExists > 0) throw new Error('User already exists in this departmnet');
      const departmentUser = await this.departmentUserRepository.create(departmentUserData as unknown as DepartmentUser)
      await this.departmentUserRepository.save(departmentUser)
      return departmentUser;

    } catch (error) {
      throw new BadRequestException(error.message);
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
      if (result.affected === 0) throw new Error('User does not exists in this department')
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findDepartmentUsers(department_id: number) {
    try {
      const departmentUsers = await this.departmentUserRepository.find({
        where: {
          department_id: { id: department_id }
        }
      })

      // const departmentUsers = await this.departmentUserRepository
      //   .createQueryBuilder('du')
      //   .where('du.department_id = :departmentId', { departmentId: department_id })
      //   .getRawMany()

      return departmentUsers;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
