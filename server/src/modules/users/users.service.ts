import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../../database/entities/user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { ReplaceUserDto } from './dto/replace-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

function mapEmailConstraintError(error: unknown): never {
  if (
    error instanceof QueryFailedError &&
    error.driverError.code === '23505' &&
    error.driverError.constraint === 'users_email_unique'
  ) {
    throw new ConflictException('Email already registered');
  }
  throw error;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async createUser(dto: CreateUserDto) {
    if (await this.findByEmail(dto.email)) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.users.save(
        this.users.create({
          email: dto.email,
          passwordHash,
          firstName: dto.name,
        }),
      );
      return this.toResponse(user);
    } catch (error) {
      mapEmailConstraintError(error);
    }
  }

  findByEmail(email: string) {
    return this.users.findOneBy({ email });
  }

  async findById(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return this.toResponse(user);
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const existing = await this.findById(id);
    const updateData: Partial<UserEntity> = {};

    if (dto.name !== undefined) updateData.firstName = dto.name;
    if (dto.email !== undefined) {
      const userWithEmail = await this.findByEmail(dto.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException('Email already registered');
      }
      updateData.email = dto.email;
    }
    if (dto.lastName !== undefined) updateData.lastName = dto.lastName;
    if (Object.keys(updateData).length === 0) return existing;

    try {
      const result = await this.users.update({ id }, updateData);
      if (!result.affected) throw new NotFoundException('User not found');
      return this.findById(id);
    } catch (error) {
      mapEmailConstraintError(error);
    }
  }

  async replaceUser(id: string, dto: ReplaceUserDto) {
    await this.findById(id);
    const userWithEmail = await this.findByEmail(dto.email);
    if (userWithEmail && userWithEmail.id !== id) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    try {
      const result = await this.users.update(
        { id },
        {
          firstName: dto.name,
          lastName: dto.lastName,
          email: dto.email,
          passwordHash,
        },
      );
      if (!result.affected) throw new NotFoundException('User not found');
      return this.findById(id);
    } catch (error) {
      mapEmailConstraintError(error);
    }
  }

  private toResponse(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }
}
