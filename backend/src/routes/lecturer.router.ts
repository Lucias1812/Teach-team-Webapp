// src/routes/lecturer.router.ts
import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { LecturerCourse } from '../entities/LecturerCourse';
import { Application, SessionType, AvailabilityType } from '../entities/Application';
import { User } from '../entities/User';

const router = Router();
const userRepo = AppDataSource.getRepository(User);
const lcRepo   = AppDataSource.getRepository(LecturerCourse);
const appRepo  = AppDataSource.getRepository(Application);

// ─── Middleware: require a logged-in lecturer ───────────────────────────────
router.use(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const sessionUser = req.session.user;
  if (!sessionUser) {
    res.status(401).json({ error: 'Not logged in' });
    return;
  }

  const me = await userRepo.findOneBy({ id: sessionUser.id });
  if (!me || me.role !== 'lecturer') {
    res.status(403).json({ error: 'Forbidden: not a lecturer' });
    return;
  }

  next();
});

// ─── GET /lecturers/courses ─── only the courses this lecturer teaches ──────
router.get(
  '/courses',
  async (_req: Request, res: Response): Promise<void> => {
    const lecturerId = (_req.session.user as any).id;
    const assignments = await lcRepo.find({
      where: { lecturer: { id: lecturerId } },
      relations: ['course']
    });
    const courses = assignments.map(lc => lc.course);
    res.json(courses);
  }
);

// ─── GET /lecturers/applications/:courseId ─ applicants for one course with filters ─────
router.get(
  '/applications/:courseId',
  async (req: Request, res: Response): Promise<void> => {
    const lecturerId = (req.session.user as any).id;
    const courseId = Number(req.params.courseId);
    if (isNaN(courseId)) {
      res.status(400).json({ error: 'Invalid course ID' });
      return;
    }

    // ensure this lecturer actually teaches the course
    const teaching = await lcRepo.findOne({
      where: {
        lecturer: { id: lecturerId },
        course:    { id: courseId }
      }
    });
    if (!teaching) {
      res.status(403).json({ error: 'Not assigned to this course' });
      return;
    }

    // read optional filters from query
    const {
      name,
      roleApplied,
      availability,
      skillSet,
    } = req.query as Record<string, string>;

    // build a query with filters pushed to SQL
    const qb = appRepo
      .createQueryBuilder('app')
      .innerJoinAndSelect('app.candidate', 'cand')
      .where('app.courseId = :courseId', { courseId });

    if (name) {
      qb.andWhere('cand.username LIKE :name', { name: `%${name}%` });
    }
    if (roleApplied && Object.values(SessionType).includes(roleApplied as SessionType)) {
      qb.andWhere('app.roleApplied = :roleApplied', { roleApplied });
    }
    if (availability && Object.values(AvailabilityType).includes(availability as AvailabilityType)) {
      qb.andWhere('app.availability = :availability', { availability });
    }
    if (skillSet) {
      qb.andWhere('app.skillSet LIKE :skillSet', { skillSet: `%${skillSet}%` });
    }

    const apps = await qb.getMany();

    // shape the JSON for the front end
    const result = apps.map(a => ({
      id:                   a.id,
      name:                 a.candidate.username,
      roleApplied:          a.roleApplied,
      availability:         a.availability,
      skillSet:             a.skillSet,
      academicCredentials:  a.academicCredentials,
    }));

    res.json(result);
  }
);

export default router;
