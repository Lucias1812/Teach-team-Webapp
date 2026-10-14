// src/components/Lecturers.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Course shape from backend
interface Course {
  id: number;
  code: string;
  name: string;
  semester: string;
}

// Applicant shape from filtered backend response
interface Applicant {
  id: number;
  name: string;
  roleApplied: 'TUTORIAL' | 'LAB';
  availability: 'Full-time' | 'Part-time';
  skillSet: string;
  academicCredentials: string;
}

type CommentMap = Record<number, string>;

const Lecturers: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Applicant[]>([]);
  const [comments, setComments] = useState<CommentMap>({});
  const [searchName, setSearchName] = useState<string>('');
  const [skillFilter, setSkillFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'TUTORIAL' | 'LAB' | ''>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'Full-time' | 'Part-time' | ''>('');
  const [sortBy, setSortBy] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Load lecturer's courses
  useEffect(() => {
    axios
      .get<Course[]>('http://localhost:3001/lecturers/courses', { withCredentials: true })
      .then(res => setCourses(res.data))
      .catch(() => setError('Failed to load courses'));
  }, []);

  // Fetch applicants whenever filters or course change
  useEffect(() => {
    if (selectedCourseId === '') return;
    setError('');
    axios
      .get<Applicant[]>(`http://localhost:3001/lecturers/applications/${selectedCourseId}`, {
        withCredentials: true,
        params: {
          name:         searchName,
          skillSet:     skillFilter,
          roleApplied:  roleFilter,
          availability: availabilityFilter,
        },
      })
      .then(res => setApplicants(res.data))
      .catch(() => setError('Failed to load applicants'));

    // reset selections & comments when course changes
    setSelectedCandidates([]);
    setComments({});
  }, [
    selectedCourseId,
    searchName,
    skillFilter,
    roleFilter,
    availabilityFilter,
  ]);

  // Selection, ranking & comments
  const handleSelect = (app: Applicant) => {
    if (!selectedCandidates.some(c => c.id === app.id)) {
      setSelectedCandidates([...selectedCandidates, app]);
    }
  };
  const handleRankChange = (id: number, dir: 'up' | 'down') => {
    const idx = selectedCandidates.findIndex(c => c.id === id);
    if (idx < 0) return;
    const arr = [...selectedCandidates];
    if (dir === 'up' && idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    if (dir === 'down' && idx < arr.length - 1) [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    setSelectedCandidates(arr);
  };
  const handleCommentChange = (id: number, val: string) => {
    setComments(prev => ({ ...prev, [id]: val }));
  };

  // Chart data
  const applicantSelectionCounts = applicants.map(a => ({
    name: a.name,
    count: selectedCandidates.filter(c => c.id === a.id).length,
  }));

  return (
    <div className="lecturer-container">
      <div className="lecturer-wrapper">
        <h2 className="heading">Lecturer Dashboard – Tutor Applicants</h2>

        <div className="form-group">
          <label>Select Course</label>
          <select
            className="input"
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value === '' ? '' : Number(e.target.value))}
          >
            <option value="">-- Choose a course --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.name} ({c.semester})
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error">{error}</p>}

        {selectedCourseId !== '' && (
          <>
            <div className="filter-grid">
              <input
                type="text"
                placeholder="Filter by candidate name…"
                className="input"
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Filter by skill…"
                className="input"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
              />
              <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)}>
                <option value="">All Roles</option>
                <option value="TUTORIAL">Tutorial</option>
                <option value="LAB">Lab</option>
              </select>
              <select
                className="input"
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value as any)}
              >
                <option value="">All Availability</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>

            <h3 className="subheading">Applicants</h3>
            <div className="card-grid">
              {applicants.map(app => (
                <div key={app.id} className="card">
                  <h4>{app.name}</h4>
                  <p><strong>Skills:</strong> {app.skillSet}</p>
                  <p><strong>Academic Credentials:</strong> {app.academicCredentials}</p>
                  <p><strong>Role:</strong> {app.roleApplied}</p>
                  <p><strong>Availability:</strong> {app.availability}</p>
                  <button onClick={() => handleSelect(app)}>Select Candidate</button>
                </div>
              ))}
            </div>

            <h3 className="subheading">Selected Candidates (Ranked)</h3>
            <div className="ranked-list">
              {selectedCandidates.map((c, i) => (
                <div key={c.id} className="ranked-item">
                  <div className="ranked-content">
                    <p className="ranked-name">#{i + 1} – {c.name}</p>
                    <label htmlFor={`comment-${c.id}`}>Comments:</label>
                    <textarea
                      id={`comment-${c.id}`}
                      className="textarea"
                      rows={3}
                      maxLength={300}
                      placeholder="Add comments here..."
                      value={comments[c.id] || ''}
                      onChange={e => handleCommentChange(c.id, e.target.value)}
                    />
                    <p className="text-muted">{(comments[c.id]?.length) || 0}/300</p>
                  </div>
                  <div className="ranked-controls">
                    <button onClick={() => handleRankChange(c.id, 'up')}>⬆️</button>
                    <button onClick={() => handleRankChange(c.id, 'down')}>⬇️</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="chart-section">
              <h3 className="chart-title">📊 Applicant Selection Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={applicantSelectionCounts}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Selections" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Lecturers;
