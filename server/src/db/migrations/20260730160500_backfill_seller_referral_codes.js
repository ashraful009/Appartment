const { generateUniqueReferralCode } = require("../../utils/referralCodeUtil");

exports.up = async function(knex) {
  const sellers = await knex('users')
    .whereNull('referral_code')
    .orWhere('referral_code', '')
    .select('id', 'roles');

  for (const user of sellers) {
    let roles = [];
    if (typeof user.roles === 'string') {
      try { roles = JSON.parse(user.roles); } catch(e) { roles = []; }
    } else if (Array.isArray(user.roles)) {
      roles = user.roles;
    }

    if (roles.includes('seller')) {
      const newCode = await generateUniqueReferralCode();
      await knex('users').where({ id: user.id }).update({ referral_code: newCode });
    }
  }
};

exports.down = async function(knex) {
  // No rollback needed for backfilled codes
};
