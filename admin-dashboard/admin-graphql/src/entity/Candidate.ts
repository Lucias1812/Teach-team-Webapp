import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Application } from "./Application";

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ default: false })
  blocked!: boolean;

  @OneToMany(() => Application, app => app.candidate)
  applications!: Application[];
}
