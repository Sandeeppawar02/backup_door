module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: '127.0.0.1',         // or your PostgreSQL server host
      user: 'postgres',
      password: '7894',
      database: 'osl_new'
    },
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  }
};