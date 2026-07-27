
exports.up = async function(knex) {
  return knex.schema.alterTable('memberships', (table) => {
    
    
    table.index('user_id');
    table.dropUnique(['user_id', 'property_id']);
  });
};


exports.down = async function(knex) {
  return knex.schema.alterTable('memberships', (table) => {
    table.unique(['user_id', 'property_id']);
    table.dropIndex('user_id');
  });
};
