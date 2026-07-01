/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('phone').notNullable();
    
    // Common Profile Fields
    table.string('profile_photo').defaultTo('');
    table.timestamp('member_since').defaultTo(knex.fn.now());
    
    // Customer Fields (Using JSONB for structured data like address)
    table.jsonb('address').defaultTo('{"present": "", "permanent": ""}');
    table.string('occupation').defaultTo('');
    table.enu('preferred_contact_time', ['Morning', 'Afternoon', 'Evening', 'Anytime']).defaultTo('Anytime');
    
    table.string('referral_code').unique().nullable();
    table.uuid('referred_by').references('id').inTable('users').onDelete('SET NULL');
    
    // Roles (Array of strings)
    // Using specific ENUM for roles isn't natively supported easily for arrays in all pg versions with knex without raw, so using JSONB array or specific knex syntax. Using specific JSONB or text array is better.
    table.specificType('roles', 'text[]').defaultTo('{"user"}');
    
    // Seller Fields
    table.text('bio').defaultTo('');
    table.jsonb('social_links').defaultTo('{"linkedin": "", "facebook": "", "whatsapp": ""}');
    table.specificType('expertise', 'text[]').defaultTo('{}');
    
    // Guest Lead Flag
    table.boolean('is_guest').defaultTo(false);
    
    table.timestamps(true, true); // created_at, updated_at
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
