import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';

export enum SessionType {
  TUTORIAL = 'TUTORIAL',
  LAB      = 'LAB',
}

export enum AvailabilityType {
  FULL_TIME = 'Full-time',
  PART_TIME = 'Part-time',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.applications, { eager: true })
  candidate!: User;

  @ManyToOne(() => Course, course => course.applications, { eager: true })
  course!: Course;

  @Column({ type: 'enum', enum: SessionType })
  roleApplied!: SessionType;

  @Column({ type: 'enum', enum: AvailabilityType })
  availability!: AvailabilityType;

  @Column()
  skillSet!: string;

  @Column()
  academicCredentials!: string;
}
