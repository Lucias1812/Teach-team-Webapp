import { gql } from "apollo-server";

export const typeDefs = gql`
  type Admin { username: String! }
  type Course { id: ID! title: String! semester: String! }
  type Lecturer { id: ID! name: String! courses: [Course!]! }
  type Candidate { id: ID! username: String! blocked: Boolean! }
  type CourseCandidates { course: Course! candidates: [Candidate!]! }

  type Query {
    courses: [Course!]!
    lecturers: [Lecturer!]!
    candidatesPerCourse: [CourseCandidates!]!
    candidatesMoreThanThree: [Candidate!]!
    candidatesNone: [Candidate!]!
  }

  type Mutation {
    login(username: String!, password: String!): String!
    assignLecturer(courseId: ID!, lecturerId: ID!): Boolean!
    addCourse(title: String!, semester: String!): Course!
    editCourse(id: ID!, title: String, semester: String): Course!
    deleteCourse(id: ID!): Boolean!
    blockCandidate(candidateId: ID!): Boolean!
    unblockCandidate(candidateId: ID!): Boolean!
  }
`;
