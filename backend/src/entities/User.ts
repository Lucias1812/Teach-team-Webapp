import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

export enum UserRole {
  CANDIDATE = 'candidate',
  LECTURER = 'lecturer',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CANDIDATE })
  role!: UserRole;

  @CreateDateColumn()
  joinDate!: Date;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: false })
  isBlocked!: boolean;

  @OneToMany(() => Application, app => app.candidate)
  applications!: Application[];

  @OneToMany(() => LecturerCourse, lc => lc.lecturer)
  teaching!: LecturerCourse[];
}
