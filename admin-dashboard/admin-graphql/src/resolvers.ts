import { Course } from "./entity/Course";
import { Lecturer } from "./entity/Lecturer";
import { Candidate } from "./entity/Candidate";
import { Application } from "./entity/Application";
import jwt from "jsonwebtoken";
import { DataSource } from "typeorm";

const SECRET = "CHANGE_THIS_SECRET";

export const resolvers = {
  Query: {
    courses: async (_: any, __: any, { dataSource }: { dataSource: DataSource }) => {
      return dataSource.getRepository(Course).find();
    },
    lecturers: async (_: any, __: any, { dataSource }: { dataSource: DataSource }) => {
      return dataSource.getRepository(Lecturer).find({ relations: ["courses"] });
    },
    candidatesPerCourse: async (_: any, __: any, { dataSource }: { dataSource: DataSource }) => {
      const courseRepo = dataSource.getRepository(Course);
      const appRepo = dataSource.getRepository(Application);

      const courses = await courseRepo.find();
      return Promise.all(
        courses.map(async (c: Course) => {
          const apps = await appRepo.find({
            where: { courseId: c.id },
            relations: ["candidate"],
          });
          const candidates = apps.map((a: Application) => a.candidate);
          return { course: c, candidates };
        })
      );
    },
    candidatesMoreThanThree: async (_: any, __: any, { dataSource }: { dataSource: DataSource }) => {
      const appRepo = dataSource.getRepository(Application);
      const raw = await appRepo
        .createQueryBuilder("app")
        .select("app.candidateId", "candidateId")
        .addSelect("COUNT(app.id)", "count")
        .groupBy("app.candidateId")
        .having("COUNT(app.id) > 3")
        .getRawMany<{ candidateId: number }>();

      const candRepo = dataSource.getRepository(Candidate);
      const ids = raw.map((r) => r.candidateId);
      return candRepo.findByIds(ids);
    },
    candidatesNone: async (_: any, __: any, { dataSource }: { dataSource: DataSource }) => {
      const candRepo = dataSource.getRepository(Candidate);
      return candRepo
        .createQueryBuilder("c")
        .leftJoinAndSelect("c.applications", "app")
        .where("app.id IS NULL")
        .getMany();
    },
  },

  Mutation: {
    login: async (_: any, { username, password }: any) => {
      if (username === "admin" && password === "admin") {
        return jwt.sign({ username }, SECRET, { expiresIn: "1h" });
      }
      throw new Error("Invalid credentials");
    },
    assignLecturer: async (
      _: any,
      { courseId, lecturerId }: { courseId: number; lecturerId: number },
      { dataSource }: { dataSource: DataSource }
    ) => {
      const lectRepo = dataSource.getRepository(Lecturer);
      const courseRepo = dataSource.getRepository(Course);
      const lecturer = await lectRepo.findOne({
        where: { id: lecturerId },
        relations: ["courses"],
      });
      const course = await courseRepo.findOneBy({ id: courseId });
      if (!lecturer || !course) throw new Error("Not found");
      lecturer.courses.push(course);
      await lectRepo.save(lecturer);
      return true;
    },
    addCourse: async (
      _: any,
      { title, semester }: { title: string; semester: string },
      { dataSource }: { dataSource: DataSource }
    ) => {
      return dataSource.getRepository(Course).save({ title, semester });
    },
    editCourse: async (
      _: any,
      { id, title, semester }: { id: number; title?: string; semester?: string },
      { dataSource }: { dataSource: DataSource }
    ) => {
      const repo = dataSource.getRepository(Course);
      const course = await repo.findOneBy({ id });
      if (!course) throw new Error("Course not found");
      if (title !== undefined) course.title = title;
      if (semester !== undefined) course.semester = semester;
      return repo.save(course);
    },
    deleteCourse: async (_: any, { id }: { id: number }, { dataSource }: { dataSource: DataSource }) => {
      await dataSource.getRepository(Course).delete(id);
      return true;
    },
    blockCandidate: async (
      _: any,
      { candidateId }: { candidateId: number },
      { dataSource }: { dataSource: DataSource }
    ) => {
      const repo = dataSource.getRepository(Candidate);
      const cand = await repo.findOneBy({ id: candidateId });
      if (!cand) throw new Error("Candidate not found");
      cand.blocked = true;
      await repo.save(cand);
      return true;
    },
    unblockCandidate: async (
      _: any,
      { candidateId }: { candidateId: number },
      { dataSource }: { dataSource: DataSource }
    ) => {
      const repo = dataSource.getRepository(Candidate);
      const cand = await repo.findOneBy({ id: candidateId });
      if (!cand) throw new Error("Candidate not found");
      cand.blocked = false;
      await repo.save(cand);
      return true;
    },
  },
};
