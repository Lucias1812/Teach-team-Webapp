import { User } from '../entities/User';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    user.id = 1;
    user.username = 'test';
    user.passwordHash = 'hashed';

    expect(user.id).toBe(1);
    expect(user.username).toBe('test');
  });
});
