require("dotenv").config({ path: __dirname + "/.env" });

const { Pool } = require("pg");
const pg = require("pg");

pg.types.setTypeParser(pg.types.builtins.INT8, (value) => {
  return parseInt(value);
});

const pool = new Pool({
  user: "postgres",
  password: "7894",
  host: "localhost",
  port: 5432,
  database: "osl_new",
});

pool.connect();

pool.on("connect", () => {
  console.log("DB connection...!!!");
});
pool.on("end", () => {
  console.log("DB end connection...!!!");
});
pool.query("SET search_path to 'public';");
module.exports = pool;
