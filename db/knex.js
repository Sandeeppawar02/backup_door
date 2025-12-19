require("dotenv").config({ path: __dirname + "/.env" });
const { knex } = require("knex");

const Knex = knex({
  client: "pg",
  connection: {
  user: "postgres",
  password: "7894",
  host: "localhost",
  port: 5432,
  database: "osl_new",
  },
});

module.exports = Knex;
