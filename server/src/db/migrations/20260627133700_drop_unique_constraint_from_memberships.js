/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.schema.alterTable('memberships', (table) => {
    // MySQL requires an index for foreign keys. Dropping the unique index ['user_id', 'property_id']
    // would leave the 'user_id' foreign key without an index. We add a regular index on 'user_id' first.
    table.index('user_id');
    table.dropUnique(['user_id', 'property_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  return knex.schema.alterTable('memberships', (table) => {
    table.unique(['user_id', 'property_id']);
    table.dropIndex('user_id');
  });
};
