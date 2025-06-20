import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class TransferDto {
  @IsUUID()
  fromId: string;

  @IsUUID()
  toId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount must be a number' })
  @IsPositive({ message: 'amount must be greater than zero' })
  amount: number;
}
