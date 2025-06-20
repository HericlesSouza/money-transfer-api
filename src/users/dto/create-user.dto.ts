import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @Type(() => Date)
  @IsDate({ message: 'birthdate must be a valid Date' })
  birthdate: Date;
}
