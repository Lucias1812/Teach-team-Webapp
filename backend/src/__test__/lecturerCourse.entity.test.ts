import { LecturerCourse } from '../entities/LecturerCourse';

describe('LecturerCourse Entity', () => {
  it('should correctly assign lecturerId and courseId', () => {
    const lc = new LecturerCourse();
    lc.id = 1;
    lc.lecturer = { id: 2 } as any;
    lc.course = { id: 3 } as any;

    expect(lc.lecturer.id).toBe(2);
    expect(lc.course.id).toBe(3);
  });
});
