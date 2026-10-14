import "reflect-metadata";
import { DataSource } from "typeorm";
import { ApolloServer } from "apollo-server";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { Admin } from "./entity/Admin";
import { Course } from "./entity/Course";
import { Lecturer } from "./entity/Lecturer";
import { Candidate } from "./entity/Candidate";
import { Application } from "./entity/Application";

const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Admin, Course, Lecturer, Candidate, Application],

  // ⚠️ For development only: drop & re-create tables to match your entities
  synchronize: true,
  dropSchema: true,

  // optional: log the actual SQL for schema operations & errors
  logging: ["schema", "error"],
});

async function main() {
  await AppDataSource.initialize();
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ dataSource: AppDataSource }),
  });
  const { url } = await server.listen({ port: 4001 });
  console.log(`🚀 Server ready at ${url}`);
}

main().catch(console.error);
