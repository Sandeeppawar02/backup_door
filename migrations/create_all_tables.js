exports.up = async function (knex) {
  // Create roles table
  await knex.schema.createTable('roles', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 50);
    table.string('slug', 50);
  });



  // Create categories table
  await knex.schema.createTable('categories', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create sub_categories table
  await knex.schema.createTable('sub_categories', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 100);
    table.integer('category_id').references('id').inTable('categories').onDelete('CASCADE');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create company table (initially without user references)
  await knex.schema.createTable('company', (table) => {
    table.bigIncrements('id').primary();
    table.string('company_name', 255);
    table.integer('user_count');
     table.string('company_email', 100);
    table.text('company_logo');
    table.string('description', 255);
    table.integer('category_id').references('id').inTable('categories').onDelete('SET NULL');
    table.integer('sub_category_id').references('id').inTable('sub_categories').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });

  // Create users table (initially without company reference)
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('first_name', 50);
    table.string('last_name', 50);
    table.string('mobile_number', 50);
    table.string('password', 255);
    table.string('email', 100);
    table.text('profile_img');
    table.smallint('role_id').references('id').inTable('roles').onDelete('SET NULL');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });

  // Alter users table to add company_id foreign key now
  await knex.schema.alterTable('users', (table) => {
    table.integer('company_id').references('id').inTable('company').onDelete('SET NULL');
    table.bigint('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.bigint('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.bigint('deleted_by').references('id').inTable('users').onDelete('SET NULL');
  });

  // Alter company table to add created_by foreign keys now
  await knex.schema.alterTable('company', (table) => {
    table.bigint('created_by').references('id').inTable('users').onDelete('SET NULL');
    table.bigint('updated_by').references('id').inTable('users').onDelete('SET NULL');
    table.bigint('deleted_by').references('id').inTable('users').onDelete('SET NULL');
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('company');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('sub_categories');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('roles');
};
