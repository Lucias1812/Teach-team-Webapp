import { Course } from '../entities/Course';

describe('Course Entity', () => {
  it('should correctly create a course object', () => {
    const course = new Course();
    course.id = 10;
    course.name = 'COMP1001';

    expect(course.id).toBe(10);
    expect(course.name).toBe('COMP1001');
  });
});
