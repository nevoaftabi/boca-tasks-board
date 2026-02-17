import dotenv from 'dotenv';
dotenv.config();

import { app } from './app';
import { prismaClient } from "./services/prisma";

const { PORT } = process.env;

if (!PORT) {
  throw new Error("PORT is missing");
}
 
async function main() {
  await prismaClient.$connect();

  app.listen(Number(PORT), () => {
    console.log(`App listening on port ${PORT}`);
  });
}

main().catch((err) => {
  console.log(`Failed to start server:`, err);
})
