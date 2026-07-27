
exports.up = function(knex) {
  return knex.schema.alterTable('banners', (table) => {
    table.dropColumn('image_url');
    table.dropColumn('link');
    table.string('media_type').defaultTo('image');
    table.string('desktop_media_url').nullable();
    table.string('desktop_public_id').nullable();
    table.string('mobile_media_url').nullable();
    table.string('mobile_public_id').nullable();
  });
};


exports.down = function(knex) {
  return knex.schema.alterTable('banners', (table) => {
    table.dropColumn('media_type');
    table.dropColumn('desktop_media_url');
    table.dropColumn('desktop_public_id');
    table.dropColumn('mobile_media_url');
    table.dropColumn('mobile_public_id');
    table.string('image_url').nullable();
    table.string('link').nullable();
  });
};
