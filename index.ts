// index.cjs
const concurrently = require("concurrently");

concurrently(
  [
    { name: "server", command: "ts-node-dev --files --respawn src/index.ts", cwd: "server" },
    //{ name: "client", command: "npm run dev", cwd: "client" },
  ],
  { killOthers: ["failure", "success"] }
);