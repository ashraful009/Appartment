/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('documents', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').notNullable();
    
    table.enu('title', ['NID', 'Passport', 'TIN Certificate', 'Booking Receipt', 'Other']).notNullable();
    
    table.string('file_url').notNullable();
    table.string('public_id').notNullable();
    
    table.enu('status', ['Pending Verification', 'Verified', 'Rejected']).defaultTo('Pending Verification');
    table.timestamp('uploaded_at').defaultTo(knex.fn.now());
    
    table.timestamps(true, true);
    
    table.index(['user_id', 'uploaded_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('documents');
};
