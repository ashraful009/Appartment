const priceRequestRepository = require("../repositories/PriceRequestRepository");
const interactionRepository = require("../repositories/InteractionRepository");
const paymentPlanRepository = require("../repositories/PaymentPlanRepository");

/**
 * GET /api/customer/overview
 */
const getCustomerOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeRequestsCountRec = await priceRequestRepository.db('price_requests').where({ user_id: userId }).count('id as count').first();
    const activeRequestsCount = parseInt(activeRequestsCountRec.count, 10);
    
    const userLeadIdsDocs = await priceRequestRepository.db('price_requests').where({ user_id: userId }).select('id');
    const userLeadIds = userLeadIdsDocs.map(doc => doc.id);

    const savedPropertiesCount = req.user.wishlist?.length ?? 0;

    let upcomingMeeting = null;

    if (userLeadIds.length > 0) {
      const upcomingMeetingRaw = await interactionRepository.db('interactions')
        .whereIn('lead_id', userLeadIds)
        .where('next_meeting_date', '>', new Date())
        .where({ follow_up_status: "Pending" })
        .orderBy('next_meeting_date', 'asc')
        .leftJoin('price_requests', 'interactions.lead_id', 'price_requests.id')
        .leftJoin('properties', 'price_requests.property_id', 'properties.id')
        .leftJoin('users', 'interactions.seller_id', 'users.id')
        .select(
            'interactions.*',
            'price_requests.property_id', 'price_requests.pipeline_stage', 'price_requests.priority',
            'properties.title as propertyTitle', 'properties.location as propertyLocation',
            'users.name as sellerName', 'users.phone as sellerPhone', 'users.profile_photo as sellerProfilePhoto'
        )
        .first();

        if (upcomingMeetingRaw) {
            upcomingMeeting = {
                ...upcomingMeetingRaw,
                _id: upcomingMeetingRaw.id,
                leadId: {
                    _id: upcomingMeetingRaw.lead_id,
                    property: { _id: upcomingMeetingRaw.property_id, title: upcomingMeetingRaw.propertyTitle, location: upcomingMeetingRaw.propertyLocation },
                    pipelineStage: upcomingMeetingRaw.pipeline_stage,
                    priority: upcomingMeetingRaw.priority
                },
                sellerId: {
                    _id: upcomingMeetingRaw.seller_id,
                    name: upcomingMeetingRaw.sellerName,
                    phone: upcomingMeetingRaw.sellerPhone,
                    profilePhoto: upcomingMeetingRaw.sellerProfilePhoto
                },
                nextMeetingDate: upcomingMeetingRaw.next_meeting_date,
                followUpStatus: upcomingMeetingRaw.follow_up_status
            };
        }
    }

    res.status(200).json({
      success: true,
      data: {
        activeRequestsCount,
        savedPropertiesCount,
        upcomingMeeting,
      },
    });
  } catch (error) {
    console.error("getCustomerOverview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer overview.",
    });
  }
};

/**
 * GET /api/customer/journey
 */
const getCustomerJourney = async (req, res) => {
  try {
    const userId = req.user.id;

    const inquiriesRaw = await priceRequestRepository.db('price_requests')
        .where({ user_id: userId })
        .orderBy('price_requests.created_at', 'desc')
        .leftJoin('properties', 'price_requests.property_id', 'properties.id')
        .leftJoin('users as assigned', 'price_requests.assigned_to', 'assigned.id')
        .select(
            'price_requests.*',
            'properties.id as propertyId', 'properties.name as propertyName', 'properties.main_image as propertyMainImage', 'properties.address as propertyAddress',
            'assigned.id as assignedId', 'assigned.name as assignedName', 'assigned.phone as assignedPhone', 'assigned.email as assignedEmail', 'assigned.profile_photo as assignedProfilePhoto'
        );
        
    const inquiries = inquiriesRaw.map(i => ({
        ...i,
        _id: i.id,
        property: i.propertyId ? { _id: i.propertyId, name: i.propertyName, mainImage: i.propertyMainImage, address: i.propertyAddress } : null,
        assignedTo: i.assignedId ? { _id: i.assignedId, name: i.assignedName, phone: i.assignedPhone, email: i.assignedEmail, profilePhoto: i.assignedProfilePhoto } : null
    }));

    const paymentsRaw = await paymentPlanRepository.db('payment_plans')
        .where({ customer_id: userId })
        .orderBy('payment_plans.created_at', 'desc')
        .leftJoin('properties', 'payment_plans.property_id', 'properties.id')
        .select(
            'payment_plans.*',
            'properties.id as propertyId', 'properties.name as propertyName', 'properties.main_image as propertyMainImage'
        );
        
    const payments = paymentsRaw.map(p => ({
        ...p,
        _id: p.id,
        propertyId: p.propertyId ? { _id: p.propertyId, name: p.propertyName, mainImage: p.propertyMainImage } : null
    }));

    res.status(200).json({
      success: true,
      data: { inquiries, payments },
    });
  } catch (error) {
    console.error("getCustomerJourney error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer journey.",
    });
  }
};

module.exports = { getCustomerOverview, getCustomerJourney };
