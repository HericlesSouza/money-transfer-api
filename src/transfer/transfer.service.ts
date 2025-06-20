import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { DataSource } from 'typeorm';
import { TransferDto } from './dto/transfer.dto';

@Injectable()
export class TransferService {
  constructor(private readonly dataSource: DataSource) {}

  async transfer({ fromId, toId, amount }: TransferDto) {
    if (fromId === toId)
      throw new BadRequestException('fromId and toId must differ');

    await this.dataSource.transaction(async (manager) => {
      const [from, to] = await Promise.all([
        manager.findOne(User, { where: { id: fromId } }),
        manager.findOne(User, { where: { id: toId } }),
      ]);

      if (!from || !to) throw new NotFoundException('User not found');
      if (+from.balance < amount)
        throw new ForbiddenException('Insufficient funds');

      from.balance = (+from.balance - amount).toFixed(2);
      to.balance = (+to.balance + amount).toFixed(2);

      await manager.save([from, to]);
    });
  }
}
