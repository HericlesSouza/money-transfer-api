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
      password: hash,
    });

    const savedUser = await this.userRepository.save(user);

    return { id: savedUser.id };
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }

  findOne(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  findAll() {
    return this.userRepository.find({
      select: ['id', 'username', 'birthdate', 'balance'],
    });
  }
}
