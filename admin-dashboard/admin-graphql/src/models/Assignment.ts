import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Lecturer } from "./Lecturer";
import { Course } from "./Course";

@Entity()
export class Assignment {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Lecturer, { eager: true })
  lecturer!: Lecturer;

  @ManyToOne(() => Course, { eager: true })
  course!: Course;
}