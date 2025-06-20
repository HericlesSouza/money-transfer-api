import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUserRepository = () => ({
  create: jest.fn(),
  exists: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
});

const HASHED_PASSWORD = 'hashed_password';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: ReturnType<typeof mockUserRepository>;
  const BASE_DTO: CreateUserDto = {
    username: 'Lucas',
    password: 'pa$$word',
    birthdate: new Date('2002-02-03'),
  };
  const SERVICE_SALT = 10;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  afterEach(() => jest.clearAllMocks());

  describe('create()', () => {
    it('throws ConflictException when the username is already taken', async () => {
      repository.exists.mockResolvedValue(true);

      await expect(service.create(BASE_DTO)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(repository.exists).toHaveBeenCalledWith({
        where: { username: BASE_DTO.username },
      });
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('persists a new user with balance defaulting to 0.00', async () => {
      repository.exists.mockResolvedValue(false);

      const entityToSave = {
        ...BASE_DTO,
        balance: '0.00',
        password: HASHED_PASSWORD,
      };
      repository.create.mockReturnValue(entityToSave);
      repository.save.mockResolvedValue({ id: 'uuid-1', ...entityToSave });

      const result = await service.create(BASE_DTO);

      expect(bcrypt.hash).toHaveBeenCalledWith(BASE_DTO.password, SERVICE_SALT);
      expect(repository.create).toHaveBeenCalledWith(entityToSave);
      expect(repository.save).toHaveBeenCalledWith(entityToSave);
      expect(result).toEqual({ id: 'uuid-1' });
    });

    it('normalises the provided balance to exactly two decimals', async () => {
      const dtoWithBalance: CreateUserDto = { ...BASE_DTO, balance: 42 };
      repository.exists.mockResolvedValue(false);

      const entityToSave = {
        ...dtoWithBalance,
        balance: '42.00',
        password: HASHED_PASSWORD,
      };
      repository.create.mockReturnValue(entityToSave);
      repository.save.mockResolvedValue({ id: 'uuid-2', ...entityToSave });

      const result = await service.create(dtoWithBalance);

      expect(repository.create).toHaveBeenCalledWith(entityToSave);
      expect(result).toEqual({ id: 'uuid-2' });
    });
  });

  describe('findByUsername()', () => {
    it('delegates to repository.findOne()', async () => {
      const stubUser: User = {
        id: 'id-123',
        username: 'lucas',
        password: '',
        birthdate: new Date('2000-01-01'),
        balance: '0.00',
        createdAt: new Date(),
      };
      repository.findOne.mockResolvedValue(stubUser);

      const result = await service.findByUsername('lucas');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: 'lucas' },
      });
      expect(result).toBe(stubUser);
    });
  });

  describe('findAll()', () => {
    it('returns all users', async () => {
      const users = [
        {
          id: '1',
          username: 'u1',
          birthdate: new Date('2001-01-01'),
          balance: '10.00',
        },
        {
          id: '2',
          username: 'u2',
          birthdate: new Date('2002-02-02'),
          balance: '20.00',
        },
      ] as unknown as User[];

      repository.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        select: ['id', 'username', 'birthdate', 'balance'],
      });
      expect(result).toEqual(users);
    });
  });
});
