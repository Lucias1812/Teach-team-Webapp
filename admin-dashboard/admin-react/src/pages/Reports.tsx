import React from "react";
import { useQuery, gql } from "@apollo/client";

const CHOSEN_REPORT = gql`
  query { reportChosenPerCourse { lecturer { name } course { title } } }
`;
const OVER_ASSIGNED = gql`
  query OverAssigned($threshold: Int!) { reportOverAssigned(threshold: $threshold) { id name } }
`;
const UNASSIGNED = gql`
  query { reportUnassigned { id name } }
`;

export default function Reports() {
  const { data: chosen } = useQuery(CHOSEN_REPORT);
  const { data: over } = useQuery(OVER_ASSIGNED, { variables: { threshold: 3 } });
  const { data: unassigned } = useQuery(UNASSIGNED);

  return (
    <div>
      <h2>Chosen per Course</h2>
      <ul>
        {chosen?.reportChosenPerCourse.map((r: any, i: number) => (
          <li key={i}>{r.course.title} - {r.lecturer.name}</li>
        ))}
      </ul>
      <h2>Lecturers with >3 Assignments</h2>
      <ul>
        {over?.reportOverAssigned.map((l: any) => (
          <li key={l.id}>{l.name}</li>
        ))}
      </ul>
      <h2>Unassigned Lecturers</h2>
      <ul>
        {unassigned?.reportUnassigned.map((l: any) => (
          <li key={l.id}>{l.name}</li>
        ))}
      </ul>
    </div>
  );
}