import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Admin { id: ID! username: String! }
  type Lecturer { id: ID! name: String! }
  type Course   { id: ID! title: String! semester: String! }
  type Candidate { id: ID! name: String! blocked: Boolean! }
  type Assignment { id: ID! lecturer: Lecturer! course: Course! }
  type AuthPayload { token: String! }

  input CourseInput { title: String! semester: String! }

  type Query {
    courses(semester: String!): [Course!]!
    lecturers: [Lecturer!]!
    candidates: [Candidate!]!
    reportChosenPerCourse: [Assignment!]!
    reportOverAssigned(threshold: Int!): [Lecturer!]!
    reportUnassigned: [Lecturer!]!
  }

  type Mutation {
    login(username: String!, password: String!): AuthPayload!
    addCourse(input: CourseInput!): Course!
    editCourse(id: ID!, input: CourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
    assignLecturer(courseId: ID!, lecturerId: ID!): Assignment!
    blockCandidate(id: ID!): Candidate!
    unblockCandidate(id: ID!): Candidate!
  }

  type Subscription {
    candidateUnavailable: Candidate!
  }
`;
