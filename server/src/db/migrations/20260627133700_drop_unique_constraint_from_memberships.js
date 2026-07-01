/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  return knex.schema.alterTable('memberships', (table) => {
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
  });
};
