import { Application, SessionType, AvailabilityType } from '../entities/Application';

describe('Application Entity', () => {
  it('should correctly create an Application instance with required fields', () => {
    const app = new Application();
    app.id = 1;
    app.roleApplied = SessionType.LAB;
    app.availability = AvailabilityType.PART_TIME;
    app.skillSet = 'Java, Python, TypeScript';
    app.academicCredentials = 'BSc Computer Science';

    // We skip candidate and course (relations) for unit-level testing
    expect(app.id).toBe(1);
    expect(app.roleApplied).toBe(SessionType.LAB);
    expect(app.availability).toBe(AvailabilityType.PART_TIME);
    expect(app.skillSet).toBe('Java, Python, TypeScript');
    expect(app.academicCredentials).toBe('BSc Computer Science');
  });

  it('should allow updating enum fields', () => {
    const app = new Application();
    app.roleApplied = SessionType.TUTORIAL;
    app.availability = AvailabilityType.FULL_TIME;

    expect(app.roleApplied).toBe('TUTORIAL');
    expect(app.availability).toBe('Full-time');
  });
});
