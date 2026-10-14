import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

import { User }           from './entities/User';
import { Course }         from './entities/Course';
import { Application }    from './entities/Application';
import { LecturerCourse } from './entities/LecturerCourse';

export const AppDataSource = new DataSource({
  type:     'mysql',
  host:     process.env.DB_HOST!,
  port:     Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  synchronize: true,
  logging:     false,
  entities:    [User, Course, Application, LecturerCourse],
});
