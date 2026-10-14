import { PubSub } from "graphql-subscriptions";
import { getRepository } from "typeorm";
import jwt from "jsonwebtoken";
import { Lecturer } from "../models/Lecturer";
import { Course } from "../models/Course";
import { Candidate } from "../models/Candidate";
import { Assignment } from "../models/Assignment";

const CANDIDATE_UNAVAILABLE = "CANDIDATE_UNAVAILABLE";

export const resolvers = {
  Query: {
    courses: (_: any, { semester }: { semester: string }) =>
      getRepository(Course).find({ where: { semester } }),
    lecturers: () => getRepository(Lecturer).find(),
    candidates: () => getRepository(Candidate).find(),
    reportChosenPerCourse: () =>
      getRepository(Assignment).find({ relations: ["lecturer", "course"] }),
    reportOverAssigned: async (_: any, { threshold }: { threshold: number }) => {
      const assignments = await getRepository(Assignment).find({ relations: ["lecturer"] });
      const countMap: Record<number, number> = {};
      assignments.forEach(a => {
        countMap[a.lecturer.id] = (countMap[a.lecturer.id] || 0) + 1;
      });
      const all = await getRepository(Lecturer).find();
      return all.filter(l => (countMap[l.id] || 0) > threshold);
    },
    reportUnassigned: async () => {
      const assignments = await getRepository(Assignment).find({ relations: ["lecturer"] });
      const assigned = new Set(assignments.map(a => a.lecturer.id));
      return getRepository(Lecturer).createQueryBuilder("lecturer")
        .where("lecturer.id NOT IN (:...ids)", { ids: Array.from(assigned) })
        .getMany();
    }
  },
  Mutation: {
    login: (_: any, { username, password }: any) => {
      if (username === "admin" && password === "admin") {
        const token = jwt.sign({ role: "admin" }, "SECRET_KEY", { expiresIn: "1h" });
        return { token };
      }
      throw new Error("Invalid credentials");
    },
    addCourse: (_: any, { input }: any) =>
      getRepository(Course).save(input),
    editCourse: async (_: any, { id, input }: any) => {
      await getRepository(Course).update(id, input);
      return getRepository(Course).findOne(id);
    },
    deleteCourse: async (_: any, { id }: any) => {
      await getRepository(Course).delete(id);
      return true;
    },
    assignLecturer: (_: any, { courseId, lecturerId }: any) => {
      const repo = getRepository(Assignment);
      const a = repo.create({ course: { id: courseId } as any, lecturer: { id: lecturerId } as any });
      return repo.save(a);
    },
    blockCandidate: async (_: any, { id }: any, { pubSub }: any) => {
      const repo = getRepository(Candidate);
      const c = await repo.findOne(id);
      if (c) {
        c.blocked = true;
        await repo.save(c);
        pubSub.publish(CANDIDATE_UNAVAILABLE, c);
        return c;
      }
      throw new Error("Candidate not found");
    },
    unblockCandidate: async (_: any, { id }: any) => {
      const repo = getRepository(Candidate);
      const c = await repo.findOne(id);
      if (c) {
        c.blocked = false;
        return repo.save(c);
      }
      throw new Error("Candidate not found");
    }
  },
  Subscription: {
    candidateUnavailable: {
      subscribe: (_: any, __: any, { pubSub }: any) =>
        pubSub.asyncIterator([CANDIDATE_UNAVAILABLE])
    }
  }
};