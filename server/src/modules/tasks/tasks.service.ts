import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, TaskStatus } from '../../database/entities/task.entity.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly tasks: Repository<TaskEntity>,
  ) {}

  findAll() {
    return this.tasks.find({ order: { createdAt: 'ASC', id: 'ASC' } });
  }

  create(dto: CreateTaskDto) {
    const status = dto.status ?? (dto.completed ? TaskStatus.Done : TaskStatus.Todo);
    return this.tasks.save(this.tasks.create({
      ...dto,
      status,
      completed: status === TaskStatus.Done,
    }));
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.tasks.findOneBy({ id });
    if (!task) throw new NotFoundException('Task not found');

    Object.assign(task, dto);
    if (dto.status !== undefined) {
      task.completed = dto.status === TaskStatus.Done;
    } else if (dto.completed !== undefined) {
      task.status = dto.completed ? TaskStatus.Done : TaskStatus.Todo;
    }
    return this.tasks.save(task);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tasks.delete({ id });
    if (!result.affected) throw new NotFoundException('Task not found');
  }
}
