import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly BCRYPT_SALT = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<{ id: string }> {
    const exists = await this.userRepository.exists({
      where: { username: createUserDto.username },
    });
    if (exists)
      throw new ConflictException(
        'Username already in use. Please choose another.',
      );

    const hash = await bcrypt.hash(createUserDto.password, this.BCRYPT_SALT);
    const user = this.userRepository.create({
      ...createUserDto,
      balance: (createUserDto.balance ?? 0).toFixed(2),
      password: hash,
    });

    const savedUser = await this.userRepository.save(user);

    return { id: savedUser.id };
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'username', 'birthdate', 'balance'],
    });
  }
}
