import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
import { Course } from "./Course";

@Entity()
export class Lecturer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @ManyToMany(() => Course, (course) => course.lecturers)
  @JoinTable({ name: "lecturer_course" })
  courses!: Course[];
}
