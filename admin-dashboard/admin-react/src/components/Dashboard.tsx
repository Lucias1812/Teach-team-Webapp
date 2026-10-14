import React from 'react';
import AssignLecturer from './AssignLecturer';
import CourseManager from './CourseManager';
import CandidateBlocker from './CandidateBlocker';
import Reports from './Reports';

export default function Dashboard({ token }: { token: string }) {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <AssignLecturer token={token} />
      <CourseManager token={token} />
      <CandidateBlocker token={token} />
      <Reports token={token} />
    </div>
  );
}
