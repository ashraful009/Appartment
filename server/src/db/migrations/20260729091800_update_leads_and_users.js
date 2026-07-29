exports.up = async function (knex) {
  // 1. Alter users table
  await knex.schema.alterTable('users', (table) => {
    table.string('email').nullable().alter();
    table.unique('phone');
  });

  // 2. Alter price_requests table
  await knex.schema.alterTable('price_requests', (table) => {
    table.string('property_id', 36).nullable().alter();
    table.string('user_id', 36).nullable().alter();

    table.string('guest_name');
    table.string('guest_phone');
    table.string('current_holder_id', 36).references('id').inTable('users').onDelete('SET NULL');
    table.enu('source', ['login_request', 'guest_request', 'marketing_link', 'manual_add', 'legacy']).defaultTo('legacy');
  });

  // 3. Backfill current_holder_id and source on price_requests
  // If assigned_to is set, current_holder_id = assigned_to
  await knex.raw(`
    UPDATE price_requests 
    SET current_holder_id = assigned_to 
    WHERE assigned_to IS NOT NULL
  `);

  // (Source is already set to 'legacy' via defaultTo, but we can explicitly ensure it)
  await knex('price_requests').update({ source: 'legacy' });

  // 4. Create lead_links table
  await knex.schema.createTable('lead_links', (table) => {
    table.string('id', 36).primary();
    table.string('seller_id', 36).references('id').inTable('users').onDelete('CASCADE').notNullable();
    table.string('property_id', 36).references('id').inTable('properties').onDelete('CASCADE').notNullable();
    table.string('slug').unique().notNullable();
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('lead_links');

  await knex.schema.alterTable('price_requests', (table) => {
    table.dropColumn('source');
    table.dropColumn('current_holder_id');
    table.dropColumn('guest_phone');
    table.dropColumn('guest_name');
    table.string('property_id', 36).notNullable().alter();
    table.string('user_id', 36).notNullable().alter();
  });

  await knex.schema.alterTable('users', (table) => {
    table.dropUnique('phone');
    table.string('email').notNullable().alter();
  });
};
