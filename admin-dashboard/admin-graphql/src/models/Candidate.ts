import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ default: false })
  blocked!: boolean;
}