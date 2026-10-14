import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany } from "typeorm";
import { Lecturer } from "./Lecturer";
import { Application } from "./Application";

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  semester!: string;

  @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
  lecturers!: Lecturer[];

  @OneToMany(() => Application, application => application.course)
  applications!: Application[];
}
