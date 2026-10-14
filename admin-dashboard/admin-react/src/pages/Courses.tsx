import React, { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";

const GET_COURSES = gql`
  query Courses($semester: String!) {
    courses(semester: $semester) {
      id
      title
    }
  }
`;

const ADD_COURSE = gql`
  mutation AddCourse($input: CourseInput!) {
    addCourse(input: $input) {
      id
      title
    }
  }
`;

// TODO: Add EDIT_COURSE and DELETE_COURSE mutations

export default function Courses() {
  const [semester, setSemester] = useState("");
  const [title, setTitle] = useState("");
  const { data, refetch } = useQuery(GET_COURSES, { skip: !semester, variables: { semester } });
  const [addCourse] = useMutation(ADD_COURSE);

  const handleAdd = async () => {
    await addCourse({ variables: { input: { title, semester } } });
    refetch();
    setTitle("");
  };

  return (
    <div>
      <h2>Courses</h2>
      <input placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} />
      <div>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={handleAdd}>Add Course</button>
      </div>
      <ul>
        {data?.courses.map((c: any) => (
          <li key={c.id}>{c.title}</li>
        ))}
      </ul>
    </div>
  );
}