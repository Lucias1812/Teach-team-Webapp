import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity()
export class LecturerCourse {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, user => user.teaching, { eager: true })
  lecturer!: User;

  @ManyToOne(() => Course, course => course.lecturers, { eager: true })
  course!: Course;
}
