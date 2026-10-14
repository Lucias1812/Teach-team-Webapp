import { LecturerCourse } from '../entities/LecturerCourse';

describe('LecturerCourse Entity Logic', () => {
  it('should correctly map lecturer to course', () => {
    const map = new LecturerCourse();
    map.id = 100;
    map.lecturer = { id: 4 } as any;
    map.course = { id: 9 } as any;

    expect(map.id).toBe(100);
    expect(map.lecturer.id).toBe(4);
    expect(map.course.id).toBe(9);
  });
});
