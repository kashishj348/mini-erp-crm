import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/user.repository';
import { LoginInput } from '../dto/auth.dto';
import { generateToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }
}
