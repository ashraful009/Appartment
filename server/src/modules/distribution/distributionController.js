const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const userRepository = require("../../repositories/UserRepository");
const { verifyDescendantAccess } = require("../management/hierarchyController");

const getPool = async (req, res) => {
  try {
    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    let query = priceRequestRepository.db('price_requests')
      .leftJoin('properties', 'price_requests.property_id', 'properties.id')
      .leftJoin('users', 'price_requests.user_id', 'users.id')
      .select(
        'price_requests.*',
        'properties.name as propertyName',
        'users.name as userName',
        'users.phone as userPhone'
      );

    if (isAdmin) {
      query = query.whereNull('price_requests.current_holder_id');
    } else {
      query = query.where('price_requests.current_holder_id', req.user.id);
    }

    const leadsRaw = await query;

    const leads = leadsRaw.map((r) => {
      const isRegisteredUser = Boolean(r.user_id);
      const name = isRegisteredUser ? r.userName : r.guest_name;
      const phone = isRegisteredUser ? r.userPhone : r.guest_phone;
      const createdAt = r.created_at || r.created_on || r.createdAt || r.assigned_at;

      return {
        ...r,
        _id: r.id,
        id: r.id,
        propertyName: r.propertyName,
        guest_name: r.guest_name,
        guest_phone: r.guest_phone,
        userName: r.userName,
        userPhone: r.userPhone,
        created_at: createdAt,
        createdAt: createdAt,
        property: r.propertyName ? { _id: r.property_id, id: r.property_id, name: r.propertyName } : null,
        user: (isRegisteredUser || name || phone) ? {
          _id: r.user_id,
          id: r.user_id,
          name: name || "Guest Customer",
          phone: phone || "No Phone",
          isGuest: !isRegisteredUser,
        } : null,
      };
    });

    res.status(200).json({ leads });
  } catch (error) {
    console.error("getPool error:", error);
    res.status(500).json({ message: "Failed to fetch lead pool." });
  }
};

const getRecipients = async (req, res) => {
  try {
    const isAdmin = req.user.roles && req.user.roles.includes("admin");
    const isDirector = req.user.roles && req.user.roles.includes("Director");
    const isGM = req.user.roles && req.user.roles.includes("GM");
    const isAGM = req.user.roles && req.user.roles.includes("AGM");
    const isAreaManager = req.user.roles && req.user.roles.includes("area_manager");

    let targetRole = "";
    if (isAdmin) targetRole = "Director";
    else if (isDirector) targetRole = "GM";
    else if (isGM) targetRole = "AGM";
    else if (isAGM) targetRole = "area_manager";
    else if (isAreaManager) targetRole = "seller";
    else {
      return res.status(200).json({ recipients: [], targetRole: "" });
    }

    const allUsers = await userRepository.db('users').select('id', 'name', 'roles', 'superior_id');
    const allUsersMap = {};
    allUsers.forEach((u) => { allUsersMap[u.id.toString()] = u; });

    const recipients = allUsers.filter((u) => {
      // Must have the exact target role
      let roles = [];
      try {
        roles = typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles;
      } catch (e) {
        roles = [];
      }
      if (!roles.includes(targetRole)) return false;

      // Must be in caller's downline (skip check for Admin since Admin sees everyone)
      if (isAdmin) return true;
      return verifyDescendantAccess(req.user.id, u.id, allUsersMap);
    }).map(u => ({
      _id: u.id,
      id: u.id,
      name: u.name,
      role: targetRole,
    }));

    res.status(200).json({ recipients, targetRole });
  } catch (error) {
    console.error("getRecipients error:", error);
    res.status(500).json({ message: "Failed to fetch recipients." });
  }
};

const distributeLeads = async (req, res) => {
  try {
    const { leadIds, leadId, targetUserId } = req.body;
    const idsToUpdate = Array.isArray(leadIds) ? leadIds : (leadId ? [leadId] : []);

    if (idsToUpdate.length === 0) {
      return res.status(400).json({ message: "leadIds array is required." });
    }
    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required." });
    }

    const isAdmin = req.user.roles && req.user.roles.includes("admin");

    // Re-verify the target is in the caller's downline
    const allUsers = await userRepository.db('users').select('id', 'name', 'roles', 'superior_id');
    const allUsersMap = {};
    allUsers.forEach((u) => { allUsersMap[u.id.toString()] = u; });

    const targetUser = allUsersMap[targetUserId.toString()];
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found." });
    }

    if (!isAdmin && !verifyDescendantAccess(req.user.id, targetUserId, allUsersMap)) {
      return res.status(403).json({ message: "Forbidden. Target is not in your subtree." });
    }

    // Verify role is exactly one level down
    const isDirector = req.user.roles && req.user.roles.includes("Director");
    const isGM = req.user.roles && req.user.roles.includes("GM");
    const isAGM = req.user.roles && req.user.roles.includes("AGM");
    const isAreaManager = req.user.roles && req.user.roles.includes("area_manager");

    let expectedTargetRole = "";
    if (isAdmin) expectedTargetRole = "Director";
    else if (isDirector) expectedTargetRole = "GM";
    else if (isGM) expectedTargetRole = "AGM";
    else if (isAGM) expectedTargetRole = "area_manager";
    else if (isAreaManager) expectedTargetRole = "seller";

    let targetRoles = [];
    try {
      targetRoles = typeof targetUser.roles === 'string' ? JSON.parse(targetUser.roles) : targetUser.roles;
    } catch (e) {
      targetRoles = [];
    }

    if (!targetRoles.includes(expectedTargetRole)) {
      return res.status(403).json({ message: "Forbidden. Can only distribute exactly one level down." });
    }

    const isTargetSeller = targetRoles.includes("seller");

    // Perform distribution
    const updateData = {
      current_holder_id: targetUserId,
    };

    if (isTargetSeller) {
      updateData.assigned_to = targetUserId;
      updateData.status = "assigned";
      updateData.assigned_at = new Date();
    }

    const q = priceRequestRepository.db('price_requests').whereIn('id', idsToUpdate);

    // Ensure they actually own it (or it's null for Admin)
    if (isAdmin) {
      q.whereNull('current_holder_id');
    } else {
      q.where('current_holder_id', req.user.id);
    }

    const updatedCount = await q.update(updateData);

    res.status(200).json({
      message: `Successfully distributed ${updatedCount} lead(s) to ${targetUser.name}.`,
      targetUserName: targetUser.name,
      updatedCount
    });
  } catch (error) {
    console.error("distributeLeads error:", error);
    res.status(500).json({ message: "Failed to distribute leads." });
  }
};

module.exports = {
  getPool,
  getRecipients,
  distributeLeads,
};
