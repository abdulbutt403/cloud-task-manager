import { validate } from 'class-validator';
import { ReplaceUserDto } from './replace-user.dto.js';

describe('ReplaceUserDto', () => {
  it('requires name, email, and password while allowing a null lastName', async () => {
    const dto = Object.assign(new ReplaceUserDto(), {
      name: 'Ari',
      email: 'ari@example.com',
      lastName: null,
      password: 'password123',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('rejects a missing required lastName field', async () => {
    const dto = Object.assign(new ReplaceUserDto(), {
      name: 'Ari',
      email: 'ari@example.com',
      password: 'password123',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
