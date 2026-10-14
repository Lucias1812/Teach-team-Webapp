import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column()
  name!: string;

  @Column()
  semester!: string;

  @OneToMany(() => Application, app => app.course)
  applications!: Application[];

  @OneToMany(() => LecturerCourse, lc => lc.course)
  lecturers!: LecturerCourse[];
}
