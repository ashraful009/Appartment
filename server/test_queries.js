require('dotenv').config();
const knex = require("knex");
const knexConfig = require("./knexfile");
const db = knex(knexConfig.development);

async function run() {
    try {
        console.log("Testing getSellersList...");
        const sellersRaw = await db('users')
          .whereRaw("'seller' = ANY(roles)")
          .leftJoin('price_requests', function() {
              this.on('users.id', '=', 'price_requests.assigned_to')
                  .andOnNotIn('price_requests.conversion_status', ['approved', 'rejected'])
          })
          .groupBy('users.id')
          .select(
              'users.id as _id', 'users.name', 'users.email', 'users.phone',
              db.raw('COUNT(price_requests.id) as currentLeadCount')
          )
          .orderBy('currentLeadCount', 'asc')
          .orderBy('users.name', 'asc');
        console.log("getSellersList OK");
    } catch(e) {
        console.error("getSellersList Error:", e.message);
    }

    try {
        console.log("Testing getSellersPerformance...");
        const resultsRaw = await db('price_requests')
          .whereNotNull('assigned_to')
          .leftJoin('users as seller', 'price_requests.assigned_to', 'seller.id')
          .groupBy('assigned_to', 'seller.id', 'seller.name', 'seller.email', 'seller.phone')
          .select(
              'assigned_to',
              'seller.id as sellerId', 'seller.name as sellerName', 'seller.email as sellerEmail', 'seller.phone as sellerPhone',
              db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'approved' THEN 1 ELSE 0 END) as approvedCount`),
              db.raw(`SUM(CASE WHEN price_requests.conversion_status = 'pending_approval' OR price_requests.seller_conversion_status = 'pending_approval' THEN 1 ELSE 0 END) as pendingCount`),
              db.raw(`array_agg(price_requests.id) FILTER (WHERE price_requests.conversion_status = 'pending_approval' OR price_requests.seller_conversion_status = 'pending_approval') as pendingRequestIds`)
          )
          .orderBy('pendingCount', 'desc')
          .orderBy('approvedCount', 'desc');
        console.log("getSellersPerformance OK");
    } catch(e) {
        console.error("getSellersPerformance Error:", e.message);
    }
    
    try {
        console.log("Testing getAnalysisMemberships...");
        const membershipsRaw = await db('memberships')
          .whereIn('status', ['member', 'investor'])
          .leftJoin('users', 'memberships.user_id', 'users.id')
          .leftJoin('properties', 'memberships.property_id', 'properties.id')
          .select(
            'memberships.*',
            'users.id as userId', 'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone', 'users.profile_photo as userProfilePhoto',
            'properties.id as propertyId', 'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress'
          );
        console.log("getAnalysisMemberships OK");
    } catch(e) {
        console.error("getAnalysisMemberships Error:", e.message);
    }

    process.exit(0);
}

run();
