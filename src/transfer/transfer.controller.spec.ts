import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransferDto } from './dto/transfer.dto';

const transferServiceMock = () => ({
  transfer: jest.fn(),
});

class AllowAllJwtGuard implements CanActivate {
  canActivate(_ctx: ExecutionContext): boolean {
    return true;
  }
}

describe('TransferController', () => {
  let controller: TransferController;
  let service: ReturnType<typeof transferServiceMock>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [
        { provide: TransferService, useFactory: transferServiceMock },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(AllowAllJwtGuard)
      .compile();

    controller = module.get<TransferController>(TransferController);
    service = module.get(TransferService);
  });

  afterEach(() => jest.clearAllMocks());

  it('uses JwtAuthGuard in the create() method', () => {
    const guards =
      Reflect.getMetadata('__guards__', TransferController.prototype.create) ||
      [];

    expect(guards).toContain(JwtAuthGuard);
  });

  it('calls TransferService.transfer() and returns void', async () => {
    const dto: TransferDto = { fromId: 'a', toId: 'b', amount: 20 };
    service.transfer.mockResolvedValue(undefined);

    const result = await controller.create(dto);

    expect(service.transfer).toHaveBeenCalledWith(dto);
    expect(result).toBeUndefined();
  });
});
