import { DataSource, EntityManager } from 'typeorm';
import { TransferService } from './transfer.service';
import { User } from '../users/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TransferDto } from './dto/transfer.dto';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

function createMockManager(): jest.Mocked<EntityManager> {
  return {
    findOne: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<EntityManager>;
}

function createMockDataSource() {
  const manager = createMockManager();

  return {
    transaction: jest
      .fn()
      .mockImplementation(async (cb: (mgr: EntityManager) => unknown) =>
        cb(manager),
      ),
    __manager: manager,
  };
}

describe('TransferService', () => {
  let service: TransferService;
  let dataSourceMock: ReturnType<typeof createMockDataSource>;
  let manager: ReturnType<typeof createMockManager>;

  const fromUser = (balance: string): User => ({
    id: 'from',
    username: 'alice',
    password: '',
    birthdate: new Date(),
    balance,
    createdAt: new Date(),
  });

  const toUser = (balance: string): User => ({
    id: 'to',
    username: 'rodrigo',
    password: '',
    birthdate: new Date(),
    balance,
    createdAt: new Date(),
  });

  beforeEach(async () => {
    dataSourceMock = createMockDataSource();
    manager = dataSourceMock.__manager;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
  });

  afterEach(() => jest.clearAllMocks());

  it('transfer funds when everything is valid', async () => {
    manager.findOne
      .mockResolvedValueOnce(fromUser('100.00'))
      .mockResolvedValueOnce(toUser('50.00'));

    const dto: TransferDto = { fromId: 'from', toId: 'to', amount: 30 };

    await service.transfer(dto);

    expect(dataSourceMock.transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledWith([
      expect.objectContaining({ id: 'from', balance: '70.00' }),
      expect.objectContaining({ id: 'to', balance: '80.00' }),
    ]);
  });

  it('throws BadRequestException when fromId and toId are the same', async () => {
    await expect(
      service.transfer({ fromId: 'same', toId: 'same', amount: 10 }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(dataSourceMock.transaction).not.toHaveBeenCalled();
  });

  it('throws NotFoundException if any user does not exist', async () => {
    manager.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(toUser('20.00'));

    await expect(
      service.transfer({ fromId: 'ghost', toId: 'to', amount: 5 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("throws ForbiddenException when sender's balance is insufficient", async () => {
    manager.findOne
      .mockResolvedValueOnce(fromUser('10.00'))
      .mockResolvedValueOnce(toUser('0.00'));

    await expect(
      service.transfer({ fromId: 'from', toId: 'to', amount: 20 }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
