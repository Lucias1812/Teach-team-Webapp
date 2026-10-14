// src/routes/application.router.ts
import express, { Request, Response, RequestHandler } from 'express';
import { body, validationResult } from 'express-validator';
import { AppDataSource } from '../data-source';
import { Application, SessionType, AvailabilityType } from '../entities/Application';
import { User } from '../entities/User';
import { Course } from '../entities/Course';

const router = express.Router();
const applicationRepo = AppDataSource.getRepository(Application);
const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

// Validation middleware
const validateApplication = [
  body('courseId')
    .exists().withMessage('courseId is required')
    .isInt().withMessage('courseId must be an integer'),
  body('role')
    .exists().withMessage('role is required')
    .isIn(Object.values(SessionType)).withMessage(`role must be one of ${Object.values(SessionType).join(', ')}`),
  body('availability')
    .exists().withMessage('availability is required')
    .isIn(Object.values(AvailabilityType)).withMessage(`availability must be one of ${Object.values(AvailabilityType).join(', ')}`),
  body('skillSet')
    .exists().withMessage('skillSet is required')
    .isLength({ min: 1 }).withMessage('skillSet cannot be empty'),
  body('academicCredentials')
    .exists().withMessage('academicCredentials is required')
    .isLength({ min: 1 }).withMessage('academicCredentials cannot be empty'),
];

// Handler: submit application
const submitApplication: RequestHandler = async (req, res) => {
  // 1) express-validator checks
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  // 2) Auth
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { courseId, role, availability, skillSet, academicCredentials } = req.body;

  try {
    const user = await userRepo.findOneBy({ id: req.session.user.id });
    const course = await courseRepo.findOneBy({ id: courseId });
    if (!user || !course) {
      res.status(404).json({ error: 'User or course not found' });
      return;
    }

    const application = applicationRepo.create({
      candidate: user,
      course,
      roleApplied: role as SessionType,
      availability: availability as AvailabilityType,
      skillSet,
      academicCredentials,
    });

    await applicationRepo.save(application);
    res.status(201).json({ message: 'Application submitted', application });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Handler: list my applications
const listApplications: RequestHandler = async (req, res) => {
  // Auth
  if (!req.session.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const apps = await applicationRepo.find({
      where: { candidate: { id: req.session.user.id } },
      relations: ['course'],
    });
    res.json(apps);
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

router.post('/', validateApplication, submitApplication);
router.get('/me', listApplications);

export default router;
