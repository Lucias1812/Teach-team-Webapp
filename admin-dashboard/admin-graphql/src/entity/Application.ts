import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Candidate } from "./Candidate";
import { Course } from "./Course";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  id!: number;

  // foreign key column to Course
  @Column()
  courseId!: number;

  // many applications → one course
  @ManyToOne(() => Course, (course) => (course as any).applications)
  @JoinColumn({ name: "courseId" })
  course!: Course;

  // foreign key column to Candidate
  @Column()
  candidateId!: number;

  // many applications → one candidate
  @ManyToOne(() => Candidate, (cand) => cand.applications)
  @JoinColumn({ name: "candidateId" })
  candidate!: Candidate;
}
