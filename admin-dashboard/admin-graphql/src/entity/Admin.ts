import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity()
export class Admin {
  @PrimaryColumn()
  username!: string;

  @Column()
  password!: string;
}
