import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, Application as ExpressApp } from 'express';
import cors from 'cors';
import session from 'express-session';

import { AppDataSource } from './data-source';
import authRouter from './routes/auth.router';
import courseRouter from './routes/course.router';
import applicationRouter from './routes/application.router';
import lecturerRouter from './routes/lecturer.router';
import { Course } from './entities/Course';

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const app: ExpressApp = express();

    // ─── MIDDLEWARE ───────────────────────────────────────────────────────────
    app.use(cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }));
    app.use(express.json());
    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false }, // set true if using HTTPS
    }));

    const courseRepo = AppDataSource.getRepository(Course);
    const count = await courseRepo.count();

    if (count === 0) {
      const defaultCourses = [
        {
          code: 'CS201',
          name: 'Web Development',
          semester: 'Semester 2, 2025',
        },
        {
          code: 'CS202',
          name: 'Database Systems',
          semester: 'Semester 2, 2025',
        },
        {
          code: 'CS101',
          name: 'Discrete Mathematics',
          semester: 'Semester 1, 2025',
        },
        {
          code: 'CS100',
          name: 'Intro to Programming',
          semester: 'Semester 1, 2025',
        },
      ].map(data => courseRepo.create(data));

      await courseRepo.save(defaultCourses);
      console.log(`🌱 Seeded ${defaultCourses.length} default courses`);
    }
    else {
      console.log(`📚 Found ${count} existing courses, skipping seeding`);
    }

    // ─── ROUTES ────────────────────────────────────────────────────────────────
    app.use('/auth', authRouter);
    app.use('/courses', courseRouter);
    app.use('/applications', applicationRouter);
    app.use('/lecturers', lecturerRouter);

    // Health check
    app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'OK' });
    });

    // ─── START SERVER ───────────────────────────────────────────────────────────
    const PORT = Number(process.env.PORT) || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ DB connection error:', err);
    process.exit(1);
  }
}

bootstrap();

