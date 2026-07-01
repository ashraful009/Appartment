const priceRequestRepository = require("../repositories/PriceRequestRepository");
const userRepository = require("../repositories/UserRepository");
const apartmentUnitRepository = require("../repositories/ApartmentUnitRepository");
const interactionRepository = require("../repositories/InteractionRepository");

const requestSellerConversion = async (req, res) => {
  try {
    const request = await priceRequestRepository.findOne({
      id: req.params.id,
      assigned_to: req.user.id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or you do not have permission.",
      });
    }

    if (request.seller_conversion_status !== "none") {
      return res.status(400).json({
        message: `Seller conversion already ${request.seller_conversion_status}. Cannot re-submit.`,
      });
    }

    const updatedRequest = await priceRequestRepository.update(request.id, { seller_conversion_status: "pending_approval" });

    res.status(200).json({
      message: "Seller conversion request submitted. Awaiting admin approval.",
      request: { ...updatedRequest, _id: updatedRequest.id, sellerConversionStatus: updatedRequest.seller_conversion_status },
    });
  } catch (error) {
    console.error("requestSellerConversion error:", error);
    res.status(500).json({ message: "Failed to submit seller conversion request." });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const teamRaw = await userRepository.db('users')
      .where({ referred_by: req.user.id })
      .whereRaw("'seller' = ANY(roles)")
      .leftJoin('price_requests', 'users.id', 'price_requests.assigned_to')
      .groupBy('users.id')
      .select(
        'users.id', 'users.name', 'users.phone',
        userRepository.db.raw('COUNT(price_requests.id) as totalAssigned'),
        userRepository.db.raw(`COUNT(CASE WHEN price_requests.conversion_status = 'approved' THEN 1 END) as totalConverted`)
      );

    const team = teamRaw.map(u => ({
        _id: u.id,
        name: u.name,
        phone: u.phone,
        totalAssigned: parseInt(u.totalassigned, 10) || 0,
        totalConverted: parseInt(u.totalconverted, 10) || 0
    }));

    res.status(200).json({ team });
  } catch (error) {
    console.error("getMyTeam error:", error);
    res.status(500).json({ message: "Failed to fetch team data." });
  }
};

const getSellerTasks = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const allTasks = await interactionRepository.db('interactions')
      .where({ seller_id: req.user.id })
      .whereNotNull('next_meeting_date')
      .whereNot({ follow_up_status: "Completed" })
      .leftJoin('price_requests', 'interactions.lead_id', 'price_requests.id')
      .leftJoin('users', 'price_requests.user_id', 'users.id')
      .orderBy('next_meeting_date', 'asc')
      .select(
        'interactions.*',
        'price_requests.id as priceRequestId', 'price_requests.user_id as priceRequestUserId',
        'users.name as userName', 'users.phone as userPhone'
      );
      
    const formattedTasks = allTasks.map(t => ({
        ...t,
        _id: t.id,
        leadId: { _id: t.priceRequestId, user: { _id: t.priceRequestUserId, name: t.userName, phone: t.userPhone } },
        nextMeetingDate: t.next_meeting_date,
        followUpStatus: t.follow_up_status
    }));

    const todayTasks = formattedTasks.filter(t =>
      new Date(t.nextMeetingDate) >= todayStart && new Date(t.nextMeetingDate) <= todayEnd
    );
    const previousTasks = formattedTasks.filter(t =>
      new Date(t.nextMeetingDate) < todayStart
    );

    res.status(200).json({ todayTasks, previousTasks });
  } catch (error) {
    console.error("getSellerTasks error:", error);
    res.status(500).json({ message: "Failed to fetch seller tasks." });
  }
};

const getMySales = async (req, res) => {
  try {
    const units = await apartmentUnitRepository.db('apartment_units')
      .where({ action_by: req.user.id })
      .leftJoin('properties', 'apartment_units.property_id', 'properties.id')
      .orderBy('apartment_units.updated_at', 'desc')
      .select('apartment_units.*', 'properties.name as propertyName', 'properties.address as propertyAddress');

    const mappedUnits = units.map((u) => {
      return {
          ...u,
          _id: u.id,
          propertyId: { _id: u.property_id, name: u.propertyName, address: u.propertyAddress },
          customerName: u.customer_name,
          customerPhone: u.customer_phone,
          isDocumentReady: u.is_document_ready,
          ownerType: u.customer_phone === req.user.phone ? 'self' : 'customer'
      };
    });

    res.status(200).json({ success: true, units: mappedUnits });
  } catch (error) {
    console.error("getMySales error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sales." });
  }
};

const convertUnitAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionType, customerName, customerPhone } = req.body;

    const unit = await apartmentUnitRepository.findOne({ id, action_by: req.user.id });

    if (!unit) {
      return res.status(404).json({ success: false, message: "Unit not found or unauthorized." });
    }

    if (!["Sold", "Booked"].includes(actionType)) {
      return res.status(400).json({ success: false, message: "Invalid conversion type." });
    }

    if (!customerName || !customerPhone) {
      return res.status(400).json({ success: false, message: "Customer name and phone are required for conversion." });
    }

    const updates = {
        status: actionType,
        customer_name: customerName,
        customer_phone: customerPhone,
        is_document_ready: false
    };

    const existingUser = await userRepository.findOne({ phone: customerPhone });
    if (existingUser) {
      updates.customer_id = existingUser.id;
      const updatedRoles = [...new Set([...(existingUser.roles || []), "customer"])].filter(r => r !== "user");
      if (JSON.stringify(updatedRoles.sort()) !== JSON.stringify([...(existingUser.roles || [])].sort())) {
        await userRepository.update(existingUser.id, { roles: updatedRoles });
      }
    }

    const updatedUnit = await apartmentUnitRepository.update(unit.id, updates);

    res.status(200).json({ success: true, message: `Unit converted to ${actionType} successfully.`, unit: { ...updatedUnit, _id: updatedUnit.id } });
  } catch (error) {
    console.error("convertUnitAction error:", error);
    res.status(500).json({ success: false, message: "Failed to convert unit." });
  }
};

module.exports = { 
  requestSellerConversion, 
  getMyTeam, 
  getSellerTasks,
  getMySales,
  convertUnitAction
};
