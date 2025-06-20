import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

const HASHED = 'hashed_pass';
const SIGNED_TOKEN = 'jwt_token';

const usersServiceMock = () => ({
  findByUsername: jest.fn(),
});

const jwtServiceMock = () => ({
  sign: jest.fn().mockReturnValue(SIGNED_TOKEN),
});

const configServiceMock = () => ({
  get: jest.fn().mockReturnValue('3600s'),
});

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: ReturnType<typeof usersServiceMock>;
  let jwtService: ReturnType<typeof jwtServiceMock>;
  let configService: ReturnType<typeof configServiceMock>;

  const user: User = {
    id: 'uuid-1',
    username: 'alice',
    password: HASHED,
    birthdate: new Date('1990-02-03'),
    balance: '0.00',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: usersServiceMock },
        { provide: JwtService, useFactory: jwtServiceMock },
        { provide: ConfigService, useFactory: configServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('validateUser()', () => {
    it('returns user when username exists and password matches', async () => {
      usersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('alice', 'password');

      expect(usersService.findByUsername).toHaveBeenCalledWith('alice');
      expect(bcrypt.compare).toHaveBeenCalledWith('password', HASHED);
      expect(result).toBe(user);
    });

    it('returns null when user is not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);

      const result = await service.validateUser('alice', 'password');

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('returns null when password is invalid', async () => {
      usersService.findByUsername.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('alice', 'wrong_pass');

      expect(result).toBeNull();
    });
  });

  describe('login()', () => {
    it('signs JWT with sub + username and returns token + expiresIn', async () => {
      const output = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
      });
      expect(configService.get).toHaveBeenCalledWith('jwt.expiresIn');
      expect(output).toEqual({ token: SIGNED_TOKEN, expiresIn: '3600s' });
    });
  });
});
