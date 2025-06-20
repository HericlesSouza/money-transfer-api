import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  balance: string;

  @CreateDateColumn()
  createdAt: Date;
}
