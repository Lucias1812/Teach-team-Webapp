import { Lecturer } from '../entities/Lecturer';

describe('Lecturer Entity', () => {
  it('should correctly create a lecturer object', () => {
    const lecturer = new Lecturer();
    lecturer.id = 1;
    lecturer.name = 'Dr. Jane Doe';
    

    expect(lecturer.id).toBe(1);
    expect(lecturer.name).toBe('Dr. Jane Doe');
    
  });
});
