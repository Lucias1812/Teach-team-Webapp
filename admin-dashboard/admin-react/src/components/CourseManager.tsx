import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_COURSES = gql`
  query GetCourses {
    courses { id title semester }
  }
`;

const ADD_COURSE = gql`
  mutation AddCourse($title: String!, $semester: String!) {
    addCourse(title: $title, semester: $semester) { id title semester }
  }
`;

const EDIT_COURSE = gql`
  mutation EditCourse($id: ID!, $title: String, $semester: String) {
    editCourse(id: $id, title: $title, semester: $semester) { id title semester }
  }
`;

const DELETE_COURSE = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export default function CourseManager({ token }: { token: string }) {
  const { data, loading, error, refetch } = useQuery(GET_COURSES);
  const [newTitle, setNewTitle] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingSemester, setEditingSemester] = useState('');

  const [addCourse] = useMutation(ADD_COURSE, {
    onCompleted: () => {
      refetch();
      setNewTitle('');
      setNewSemester('');
    },
  });
  const [editCourse] = useMutation(EDIT_COURSE, {
    onCompleted: () => {
      refetch();
      setEditingId(null);
    },
  });
  const [deleteCourse] = useMutation(DELETE_COURSE, {
    onCompleted: () => {
      refetch();
    },
  });

  if (loading) return <p>Loading courses…</p>;
  if (error)   return <p>Error loading courses: {error.message}</p>;
  if (!data || !data.courses) return <p>No courses to display.</p>;

  return (
    <div>
      <h3>Manage Courses</h3>
      <ul>
        {data.courses.map((c: any) => (
          <li key={c.id}>
            {editingId === c.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={e => setEditingTitle(e.target.value)}
                />
                <input
                  value={editingSemester}
                  onChange={e => setEditingSemester(e.target.value)}
                />
                <button
                  onClick={() =>
                    editCourse({
                      variables: {
                        id: c.id,
                        title: editingTitle,
                        semester: editingSemester,
                      },
                    })
                  }
                >
                  Save
                </button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                {c.title} ({c.semester})
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditingTitle(c.title);
                    setEditingSemester(c.semester);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => deleteCourse({ variables: { id: c.id } })}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>

      <h4>Add New Course</h4>
      <input
        placeholder="Title"
        value={newTitle}
        onChange={e => setNewTitle(e.target.value)}
      />
      <input
        placeholder="Semester"
        value={newSemester}
        onChange={e => setNewSemester(e.target.value)}
      />
      <button
        onClick={() =>
          addCourse({ variables: { title: newTitle, semester: newSemester } })
        }
        disabled={!newTitle || !newSemester}
      >
        Add Course
      </button>
    </div>
  );
}
