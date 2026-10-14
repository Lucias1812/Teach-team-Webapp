import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_COURSES = gql`
  query GetCourses {
    courses { id title semester }
  }
`;
const GET_LECTURERS = gql`
  query GetLecturers {
    lecturers { id name }
  }
`;
const ASSIGN_LECTURER = gql`
  mutation AssignLecturer($courseId: ID!, $lecturerId: ID!) {
    assignLecturer(courseId: $courseId, lecturerId: $lecturerId)
  }
`;

export default function AssignLecturer({ token }: { token: string }) {
  // fetch courses
  const {
    loading: loadingCourses,
    error: coursesError,
    data: coursesData,
  } = useQuery(GET_COURSES);

  // fetch lecturers
  const {
    loading: loadingLecturers,
    error: lecturersError,
    data: lecturersData,
  } = useQuery(GET_LECTURERS);

  const [courseId, setCourseId] = useState<string>('');
  const [lecturerId, setLecturerId] = useState<string>('');
  const [assignLecturer, { loading: assignLoading, error: assignError, data: assignData }] =
    useMutation(ASSIGN_LECTURER);

  // 1) loading screen
  if (loadingCourses || loadingLecturers) {
    return <p>Loading…</p>;
  }
  // 2) errors
  if (coursesError) {
    return <p>Error loading courses: {coursesError.message}</p>;
  }
  if (lecturersError) {
    return <p>Error loading lecturers: {lecturersError.message}</p>;
  }
  // 3) no data guard
  const courses = coursesData?.courses || [];
  const lecturers = lecturersData?.lecturers || [];
  if (courses.length === 0 || lecturers.length === 0) {
    return <p>No courses or lecturers found.</p>;
  }

  const handleAssign = () => {
    assignLecturer({ variables: { courseId, lecturerId } });
  };

  return (
    <div>
      <h3>Assign Lecturer to Course</h3>

      <label>
        Course:
        <select value={courseId} onChange={e => setCourseId(e.target.value)}>
          <option value="">— select —</option>
          {courses.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.semester})
            </option>
          ))}
        </select>
      </label>

      <label>
        Lecturer:
        <select value={lecturerId} onChange={e => setLecturerId(e.target.value)}>
          <option value="">— select —</option>
          {lecturers.map((l: any) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handleAssign}
        disabled={!courseId || !lecturerId || assignLoading}
      >
        {assignLoading ? 'Assigning…' : 'Assign'}
      </button>

      {assignError && <p style={{ color: 'red' }}>Assignment failed: {assignError.message}</p>}
      {assignData?.assignLecturer && <p>Lecturer assigned successfully!</p>}
    </div>
  );
}
