import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransferService } from './transfer.service';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transfer')
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async create(@Body() dto: TransferDto): Promise<void> {
    await this.transferService.transfer(dto);
  }
}
