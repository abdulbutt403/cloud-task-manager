import { ParseUUIDPipe } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { vi } from 'vitest';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: any;

  beforeEach(async () => {
    usersService = {
      createUser: vi.fn(),
      findById: vi.fn(),
      updateUser: vi.fn().mockResolvedValue({ id: '1', name: 'Updated' }),
      replaceUser: vi.fn().mockResolvedValue({ id: '1', name: 'Replaced' }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes the user ID and DTO to the service for a partial update', async () => {
    const dto = { name: 'Updated' };

    await expect(controller.updateUser('1', dto)).resolves.toEqual({
      id: '1',
      name: 'Updated',
    });
    expect(usersService.updateUser).toHaveBeenCalledWith('1', dto);
  });

  it('passes the user ID and DTO to the service for a full replacement', async () => {
    const dto = {
      name: 'Replaced',
      email: 'new@example.com',
      lastName: null,
      password: 'password123',
    };

    await expect(controller.replaceUser('1', dto)).resolves.toEqual({
      id: '1',
      name: 'Replaced',
    });
    expect(usersService.replaceUser).toHaveBeenCalledWith('1', dto);
  });

  it('binds ParseUUIDPipe to GET, PATCH, and PUT user ID parameters', () => {
    for (const method of ['getUser', 'updateUser', 'replaceUser']) {
      const routeArgs = Reflect.getMetadata(
        ROUTE_ARGS_METADATA,
        UsersController,
        method,
      ) as Record<string, { pipes: unknown[] }>;

      expect(routeArgs['5:0'].pipes).toContain(ParseUUIDPipe);
    }
  });
});
