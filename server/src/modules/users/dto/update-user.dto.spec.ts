import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto.js';

describe('UpdateUserDto', () => {
  it('allows name to be omitted', async () => {
    const dto = new UpdateUserDto();

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('allows lastName to be omitted or explicitly cleared with null', async () => {
    const omitted = new UpdateUserDto();
    const cleared = Object.assign(new UpdateUserDto(), { lastName: null });

    await expect(validate(omitted)).resolves.toHaveLength(0);
    await expect(validate(cleared)).resolves.toHaveLength(0);
  });

  it.each(['', null, 123])('rejects an invalid supplied name: %s', async (name) => {
    const dto = Object.assign(new UpdateUserDto(), { name });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it.each(['', null, 'not-an-email'])(
    'rejects an invalid supplied email: %s',
    async (email) => {
      const dto = Object.assign(new UpdateUserDto(), { email });

      await expect(validate(dto)).resolves.not.toHaveLength(0);
    },
  );
});
