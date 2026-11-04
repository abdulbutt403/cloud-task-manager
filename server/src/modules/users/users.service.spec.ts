import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from '../../database/entities/user.entity.js';
import { vi } from 'vitest';

describe('UsersService', () => {
  let service: UsersService;
  let users: Partial<Repository<UserEntity>>;
  const user = (overrides: Partial<UserEntity> = {}): UserEntity => ({
    id: '1', email: 'test@example.com', passwordHash: 'hashed',
    firstName: 'Test', lastName: null, createdAt: new Date(), updatedAt: new Date(),
    ...overrides,
  });
  const response = (value: UserEntity) => ({
    id: value.id,
    email: value.email,
    name: value.firstName,
    lastName: value.lastName,
    createdAt: value.createdAt,
  });

  beforeEach(async () => {
    users = {
      findOneBy: vi.fn(),
      create: vi.fn((value) => value as UserEntity),
      save: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: users,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should throw ConflictException if email already exists', async () => {
      // Mock db.select().from().where() to return existing user
      vi.mocked(users.findOneBy!).mockResolvedValue(user());

      const dto = { email: 'test@example.com', password: 'password123', name: 'Test' };

      await expect(service.createUser(dto)).rejects.toThrow(ConflictException);
    });

    it('maps an email uniqueness race during insert to ConflictException', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValue(null);
      vi.mocked(users.save!).mockRejectedValue(new QueryFailedError('INSERT', [], {
        code: '23505', constraint: 'users_email_unique',
      }));

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('does not map a different unique constraint to an email conflict', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValue(null);
      const constraintError = new QueryFailedError('INSERT', [], {
        code: '23505', constraint: 'users_pkey',
      });
      vi.mocked(users.save!).mockRejectedValue(constraintError);

      await expect(
        service.createUser({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test',
        }),
      ).rejects.toBe(constraintError);
    });
  });

  describe('updateUser', () => {
    it('updates only the supplied name and returns the updated user', async () => {
      const currentUser = user({ firstName: 'Old name' });
      const updatedUser = user({ firstName: 'New name' });
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(currentUser).mockResolvedValueOnce(updatedUser);
      vi.mocked(users.update!).mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await expect(
        service.updateUser('1', { name: 'New name' }),
      ).resolves.toEqual(response(updatedUser));

      expect(users.update).toHaveBeenCalledWith({ id: '1' }, { firstName: 'New name' });
    });

    it.each([
      { description: 'sets lastName when supplied', dto: { lastName: 'Person' }, expected: { lastName: 'Person' } },
      { description: 'clears lastName with null', dto: { lastName: null }, expected: { lastName: null } },
    ])('$description', async ({ dto, expected }) => {
      const currentUser = user({ lastName: 'Old last name' });
      const updatedUser = user({ ...expected });
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(currentUser).mockResolvedValueOnce(updatedUser);
      vi.mocked(users.update!).mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await expect(service.updateUser('1', dto)).resolves.toEqual(response(updatedUser));
      expect(users.update).toHaveBeenCalledWith({ id: '1' }, expected);
    });

    it('throws NotFoundException when the user does not exist', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValue(null);

      await expect(service.updateUser('missing-id', { name: 'New name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(users.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException when the supplied email belongs to another user', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(user()).mockResolvedValueOnce(user({ id: '2', email: 'taken@example.com' }));

      await expect(
        service.updateUser('1', { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(users.update).not.toHaveBeenCalled();
    });

    it('maps a database email uniqueness violation to ConflictException', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(user()).mockResolvedValueOnce(null);
      vi.mocked(users.update!).mockRejectedValue(new QueryFailedError('UPDATE', [], {
        code: '23505', constraint: 'users_email_unique',
      }));

      await expect(
        service.updateUser('1', { email: 'new@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('replaceUser', () => {
    it('replaces the API fields of an existing user and hashes the password', async () => {
      const currentUser = user({ email: 'old@example.com', firstName: 'Old name' });
      const replacedUser = user({ email: 'new@example.com', firstName: 'New name', lastName: 'Person' });
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(currentUser).mockResolvedValueOnce(null).mockResolvedValueOnce(replacedUser);
      vi.mocked(users.update!).mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

      await expect(
        service.replaceUser('1', {
          name: 'New name',
          email: 'new@example.com',
          lastName: 'Person',
          password: 'newpass123',
        }),
      ).resolves.toEqual(response(replacedUser));

      expect(users.update).toHaveBeenCalledWith({ id: '1' }, expect.objectContaining({
        firstName: 'New name',
        lastName: 'Person',
        email: 'new@example.com',
        passwordHash: expect.any(String),
      }));
      expect((vi.mocked(users.update).mock.calls[0][1] as Partial<UserEntity>).passwordHash).not.toBe('newpass123');
    });

    it('throws ConflictException when the replacement email belongs to another user', async () => {
      vi.mocked(users.findOneBy!).mockResolvedValueOnce(user()).mockResolvedValueOnce(user({ id: '2', email: 'taken@example.com' }));

      await expect(
        service.replaceUser('1', {
          name: 'New name',
          email: 'taken@example.com',
          lastName: null,
          password: 'newpass123',
        }),
      ).rejects.toThrow(ConflictException);
      expect(users.update).not.toHaveBeenCalled();
    });
  });
});
