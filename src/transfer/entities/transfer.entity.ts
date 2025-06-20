import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  from: User;

  @ManyToOne(() => User, { eager: true })
  to: User;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;
}
