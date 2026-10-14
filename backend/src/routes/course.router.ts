import { Router, Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Course } from '../entities/Course';

const router = Router();
const courseRepo = AppDataSource.getRepository(Course);

// GET /courses
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const courses = await courseRepo.find();
    res.json(courses);
  } catch (err) {
    console.error('GET /courses error:', err);
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

// POST /courses
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, name, semester } = req.body;

    // Validate inputs
    if (
        typeof code !== 'string' ||
        typeof name !== 'string' ||
        typeof semester !== 'string'
      ) {
        res.status(400).json({ error: 'Missing or invalid code, name, or semester' });
        return;
      }

      // Prevent duplicates
      const exists = await courseRepo.findOneBy({ code });
      if (exists) {
        res.status(409).json({ error: 'Course code already exists' });
        return;
      }

      // Create & save
      const course = courseRepo.create();
      course.code = code;
      course.name = name;
      course.semester = semester;

      const saved = await courseRepo.save(course);
      res.status(201).json(saved);
    } catch (err) {
      console.error('POST /courses error:', err);
      res.status(500).json({ error: 'Failed to create course' });
    }
  }
);

export default router;
