import { CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersController } from './users.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

const usersServiceMock = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
});

const authServiceMock = () => ({
  login: jest.fn(),
});

class AllowAllLocalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = { id: 'user-123', username: 'bob' };
    return true;
  }
}
class AllowAllJwtGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: ReturnType<typeof usersServiceMock>;
  let authService: ReturnType<typeof authServiceMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useFactory: usersServiceMock },
        { provide: AuthService, useFactory: authServiceMock },
      ],
    })
      .overrideGuard(LocalAuthGuard)
      .useClass(AllowAllLocalGuard)
      .overrideGuard(JwtAuthGuard)
      .useClass(AllowAllJwtGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
    authService = module.get(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('signup()', () => {
    it('delegates to UsersService.create() and returns the id', async () => {
      const dto: CreateUserDto = {
        username: 'Rodrigo',
        password: 'P@ss1234',
        birthdate: new Date('1990-02-03'),
      };
      usersService.create.mockResolvedValue({ id: 'uuid-1' });

      const result = await controller.signup(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'uuid-1' });
    });
  });

  describe('signin()', () => {
    it('calls AuthService.login() with the user injected by the guard', async () => {
      const loginDto: LoginDto = { username: 'alice', password: 'secret' };
      authService.login.mockResolvedValue({
        access_token: 'jwt',
        username: 'alice',
      });

      const result = await controller.signin(loginDto, {
        user: { id: 'user-123' },
      });

      expect(authService.login).toHaveBeenCalledWith({ id: 'user-123' });
      expect(result).toEqual({ access_token: 'jwt', username: 'alice' });
    });
  });

  describe('findAll()', () => {
    it('returns all users via UsersService.findAll()', async () => {
      const users = [
        { id: '1', username: 'u1', birthdate: new Date(), balance: '0.00' },
        { id: '2', username: 'u2', birthdate: new Date(), balance: '10.00' },
      ];
      usersService.findAll.mockResolvedValue(users);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(users);
    });
  });
});
