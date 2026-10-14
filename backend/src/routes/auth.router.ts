// src/routes/auth.router.ts
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../entities/User';
import { LecturerCourse } from '../entities/LecturerCourse';

declare module 'express-session' {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: UserRole;
    };
  }
}

const router = Router();
const userRepo = AppDataSource.getRepository(User);

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  const { username, password, role } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing or invalid username/password' });
    return;
  }
  if (!['candidate', 'lecturer'].includes(role)) {
    res.status(400).json({ error: 'Invalid role selected' });
    return;
  }
  
  const existing = await userRepo.findOneBy({ username });
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = userRepo.create();
  user.username     = username;
  user.passwordHash = passwordHash;
  user.role         = role as UserRole;
  await userRepo.save(user);

  // ==== LECTURER AUTO-COURSE ASSIGNMENT ====
  if (user.role === "lecturer") {
    const lecturerCourseRepo = AppDataSource.getRepository(LecturerCourse);

    // Get all lecturers ordered by their id (ascending)
    const lecturers = await userRepo.find({
      where: { role: "lecturer" as UserRole },
      order: { id: "ASC" },
    });

    // Find this user's position among lecturers (index in sorted array)
    const lecturerIndex = lecturers.findIndex(l => l.id === user.id);

    // Only assign if they are in the first 4
    if (lecturerIndex > -1 && lecturerIndex < 4) {
      const courseId = lecturerIndex + 1; // course IDs: 1, 2, 3, 4
      const newLecturerCourse = lecturerCourseRepo.create();
      newLecturerCourse.lecturer = user;
      newLecturerCourse.course = { id: courseId } as any;
      await lecturerCourseRepo.save(newLecturerCourse);
    }
  }
  // ==== END LECTURER AUTO-COURSE ASSIGNMENT ====

  res.status(201).json({ message: 'User created' });

});

// POST /auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing or invalid username/password' });
    return;
  }

  const user = await userRepo.findOneBy({ username });
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  req.session.user = { 
    id:       user.id, 
    username: user.username, 
    role:     user.role 
  };

  res.json({
    message:  `Welcome, ${user.username}`,
    username: user.username,
    role:     user.role
  });
});

// GET /auth/logout
router.get('/logout', (req: Request, res: Response): void => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    }
  });
});

// GET /auth/profile
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  const sessUser = req.session.user;
  if (!sessUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await userRepo.findOneBy({ id: sessUser.id });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Return username, role, and joinDate
  res.json({
    username: user.username,
    role:     user.role,
    joinDate: user.joinDate    // ← added this line
  });
});

export default router;