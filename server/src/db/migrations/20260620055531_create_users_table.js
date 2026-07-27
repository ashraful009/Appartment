
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.string('id', 36).primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('phone').notNullable();
    
    
    table.string('profile_photo').defaultTo('');
    table.timestamp('member_since').defaultTo(knex.fn.now());
    
    
    table.json('address');
    table.string('occupation').defaultTo('');
    table.enu('preferred_contact_time', ['Morning', 'Afternoon', 'Evening', 'Anytime']).defaultTo('Anytime');
    
    table.string('referral_code').unique().nullable();
    table.string('referred_by', 36).references('id').inTable('users').onDelete('SET NULL');
    
    
    table.json('roles');
    
    
    table.text('bio').defaultTo('');
    table.json('social_links');
    table.json('expertise');
    
    
    table.boolean('is_guest').defaultTo(false);
    
    table.timestamps(true, true); 
  });
};


exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
