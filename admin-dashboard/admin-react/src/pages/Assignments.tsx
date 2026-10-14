import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_LECTURERS = gql`query{ lecturers{ id name } }`;
const GET_COURSES = gql`query{ courses(semester: ""){ id title } }`;
const ASSIGN_LECTURER = gql`
  mutation AssignLecturer($courseId: ID!, $lecturerId: ID!) {
    assignLecturer(courseId: $courseId, lecturerId: $lecturerId) {
      id
    }
  }
`;

export default function Assignments() {
  const { data: lData } = useQuery(GET_LECTURERS);
  const { data: cData } = useQuery(GET_COURSES);
  const [courseId, setCourseId] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [assignLecturer] = useMutation(ASSIGN_LECTURER);

  const handleAssign = async () => {
    await assignLecturer({ variables: { courseId, lecturerId } });
    alert("Assigned lecturer");
  };

  return (
    <div>
      <h2>Assign Lecturer</h2>
      <select onChange={(e) => setLecturerId(e.target.value)} value={lecturerId}>
        <option value="">Select Lecturer</option>
        {lData?.lecturers.map((l: any) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>
      <select onChange={(e) => setCourseId(e.target.value)} value={courseId}>
        <option value="">Select Course</option>
        {cData?.courses.map((c: any) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </select>
      <button onClick={handleAssign}>Assign</button>
    </div>
  );
}