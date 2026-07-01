/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.alterTable('properties', (table) => {
    table.string('progress_video_url').defaultTo('');
    table.jsonb('progress_images').defaultTo('[]');
    table.jsonb('progress_image_public_ids').defaultTo('[]');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('properties', (table) => {
    table.dropColumn('progress_video_url');
    table.dropColumn('progress_images');
    table.dropColumn('progress_image_public_ids');
  });
};
