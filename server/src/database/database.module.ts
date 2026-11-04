import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './entities/task.entity.js';
import { UserEntity } from './entities/user.entity.js';
import { CreateInitialTables1793217419480 } from './migrations/1793217419480-CreateInitialTables.js';
import { AddTaskStatus1793303819480 } from './migrations/1793303819480-AddTaskStatus.js';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [UserEntity, TaskEntity],
        migrations: [CreateInitialTables1793217419480, AddTaskStatus1793303819480],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
