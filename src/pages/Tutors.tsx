// src/pages/Tutors.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Course {
  id: number;
  code: string;
  name: string;
}

const Tutors: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [applyAsTutor, setApplyAsTutor] = useState(false);
  const [applyAsLabAssistant, setApplyAsLabAssistant] = useState(false);
  const [previousRoles, setPreviousRoles] = useState('');
  const [availability, setAvailability] = useState<'Full-time' | 'Part-time' | ''>('');
  const [skills, setSkills] = useState('');
  const [academicCredentials, setAcademicCredentials] = useState('');
  const [message, setMessage] = useState('');

  // Load courses
  useEffect(() => {
    setLoadingCourses(true);
    axios
      .get<Course[]>('http://localhost:3001/courses', { withCredentials: true })
      .then(res => {
        const data = res.data || [];
        if (data.length === 0) {
          setMessage('No courses available for selection.');
        }
        setCourses(data);
      })
      .catch(() => {
        setMessage('Failed to load courses.');
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  const validate = (): boolean => {
    if (
      !selectedCourseId ||
      (!applyAsTutor && !applyAsLabAssistant) ||
      !previousRoles.trim() ||
      !availability ||
      !skills.trim() ||
      !academicCredentials.trim()
    ) {
      alert('Please complete all fields and select at least one role.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      // match your backend SessionType enum
      const roles: Array<'TUTORIAL' | 'LAB'> = [];
      if (applyAsTutor) roles.push('TUTORIAL');
      if (applyAsLabAssistant) roles.push('LAB');

      await Promise.all(
        roles.map(role =>
          axios.post(
            'http://localhost:3001/applications',
            {
              courseId: selectedCourseId,
              role,                      // 'TUTORIAL' or 'LAB'
              availability,              // 'Full-time' or 'Part-time'
              skillSet: skills,
              academicCredentials,       // now included
            },
            { withCredentials: true }
          )
        )
      );

      setMessage('✅ Application submitted successfully!');
    } catch {
      setMessage('❌ Submission failed.');
    }
  };

  if (loadingCourses) {
    return (
      <div className="status-message">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="tutors-container">
      <div className="form-wrapper">
        <h1 className="heading">Tutor & Lab Assistant Application</h1>

        {message && (
          <p className="error text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="label">Select Course</label>
            <select
              className="input"
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value === '' ? '' : Number(e.target.value))}
              required
              disabled={courses.length === 0}
            >
              <option value="">-- Select a course --</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} – {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Apply as</label>
            <div className="checkbox-group">
              <label><input type="checkbox" checked={applyAsTutor} onChange={e => setApplyAsTutor(e.target.checked)} /> Tutor</label>
              <label><input type="checkbox" checked={applyAsLabAssistant} onChange={e => setApplyAsLabAssistant(e.target.checked)} /> Lab Assistant</label>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Previous Roles</label>
            <input
              type="text"
              className="input"
              value={previousRoles}
              onChange={e => setPreviousRoles(e.target.value)}
              placeholder="e.g. Tutor, Intro to Programming"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Availability</label>
            <div className="radio-group">
              <label><input type="radio" name="availability" value="Full-time" checked={availability === 'Full-time'} onChange={e => setAvailability(e.target.value as 'Full-time' | 'Part-time')} required /> Full-time</label>
              <label><input type="radio" name="availability" value="Part-time" checked={availability === 'Part-time'} onChange={e => setAvailability(e.target.value as 'Full-time' | 'Part-time')} /> Part-time</label>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Skills</label>
            <textarea
              className="input"
              rows={3}
              value={skills}
              onChange={e => setSkills(e.target.value)}
              placeholder="e.g. React, SQL"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Academic Credentials</label>
            <input
              type="text"
              className="input"
              value={academicCredentials}
              onChange={e => setAcademicCredentials(e.target.value)}
              placeholder="e.g. B. IT"
              required
            />
          </div>

          <button
            type="submit"
            className="button"
            disabled={courses.length === 0}
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Tutors;
