import React from 'react';
import { gql, useQuery } from '@apollo/client';

const GET_CANDIDATES_PER_COURSE = gql`
  query GetCandidatesPerCourse {
    candidatesPerCourse {
      course { id title semester }
      candidates { id username blocked }
    }
  }
`;

const GET_CANDIDATES_MORE_THAN_THREE = gql`
  query GetCandidatesMoreThanThree {
    candidatesMoreThanThree { id username blocked }
  }
`;

const GET_CANDIDATES_NONE = gql`
  query GetCandidatesNone {
    candidatesNone { id username blocked }
  }
`;

export default function Reports({ token }: { token: string }) {
  const {
    data: perCourseData,
    loading: loadingPerCourse,
    error: errorPerCourse,
  } = useQuery(GET_CANDIDATES_PER_COURSE);

  const {
    data: moreThreeData,
    loading: loadingMoreThree,
    error: errorMoreThree,
  } = useQuery(GET_CANDIDATES_MORE_THAN_THREE);

  const {
    data: noneData,
    loading: loadingNone,
    error: errorNone,
  } = useQuery(GET_CANDIDATES_NONE);

  // 1) loading
  if (loadingPerCourse || loadingMoreThree || loadingNone) {
    return <p>Loading reports…</p>;
  }
  // 2) errors
  if (errorPerCourse) {
    return <p>Error loading “candidates per course” report: {errorPerCourse.message}</p>;
  }
  if (errorMoreThree) {
    return <p>Error loading &gt;3‑courses report: {errorMoreThree.message}</p>;
  }
  if (errorNone) {
    return <p>Error loading no‑courses report: {errorNone.message}</p>;
  }

  // 3) default to empty arrays
  const perCourseList = perCourseData?.candidatesPerCourse || [];
  const moreThanThree = moreThreeData?.candidatesMoreThanThree || [];
  const noneList = noneData?.candidatesNone || [];

  return (
    <div>
      <h3>Reports</h3>

      <section>
        <h4>Candidates per Course</h4>
        {perCourseList.length === 0 ? (
          <p>No candidate data.</p>
        ) : (
          perCourseList.map((entry: any) => (
            <div key={entry.course.id}>
              <strong>
                {entry.course.title} ({entry.course.semester}):
              </strong>
              <ul>
                {entry.candidates.map((c: any) => (
                  <li key={c.id}>
                    {c.username} (blocked: {c.blocked.toString()})
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      <section>
        <h4>Candidates chosen for &gt;3 courses</h4>
        {moreThanThree.length === 0 ? (
          <p>None found.</p>
        ) : (
          <ul>
            {moreThanThree.map((c: any) => (
              <li key={c.id}>
                {c.username} (blocked: {c.blocked.toString()})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4>Candidates chosen for no courses</h4>
        {noneList.length === 0 ? (
          <p>None found.</p>
        ) : (
          <ul>
            {noneList.map((c: any) => (
              <li key={c.id}>
                {c.username} (blocked: {c.blocked.toString()})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
