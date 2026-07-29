const priceRequestRepository = require("../../repositories/PriceRequestRepository");
const userRepository = require("../../repositories/UserRepository");
const crypto = require("crypto");
const { isDuplicateKeyError, whereJsonArrayContains } = require("../../utils/dbUtils");

const createRequest = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required." });
    }

    let requestData = {
      property_id: propertyId,
      status: "pending",
      assigned_to: null,
      current_holder_id: null,
    };

    if (req.user) {
      requestData.user_id = req.user.id;
      requestData.source = "login_request";

      const existing = await priceRequestRepository.findOne({
        property_id: propertyId,
        user_id: req.user.id,
      });
      if (existing) {
        return res.status(409).json({ message: "You have already requested pricing for this property." });
      }
    } else {
      const { name, phone } = req.body;

      if (!name || !phone) {
        return res.status(400).json({
          message: "Guest requests require name and phone.",
        });
      }

      requestData.user_id = null;
      requestData.guest_name = name.trim();
      requestData.guest_phone = phone.trim();
      requestData.source = "guest_request";
      
      const existing = await priceRequestRepository.db('price_requests')
        .where({ property_id: propertyId, guest_phone: phone.trim() })
        .first();
      if (existing) {
        return res.status(409).json({ message: "You have already requested pricing for this property." });
      }
    }

    const request = await priceRequestRepository.create(requestData);

    res.status(201).json({ message: "Price request submitted successfully.", request: { ...request, _id: request.id } });
  } catch (error) {
    console.error("createRequest error:", error);
    if (isDuplicateKeyError(error)) {
      return res
        .status(409)
        .json({ message: "You have already requested pricing for this property." });
    }
    res.status(500).json({ message: "Failed to submit request." });
  }
};

const createManualLead = async (req, res) => {
  try {
    const { name, phone, propertyId } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required for manual leads." });
    }

    const requestData = {
      property_id: propertyId || null,
      user_id: null,
      guest_name: name.trim(),
      guest_phone: phone.trim(),
      status: "assigned",
      assigned_to: req.user.id,
      current_holder_id: req.user.id,
      assigned_at: new Date(),
      source: "manual_add"
    };

    const request = await priceRequestRepository.create(requestData);

    res.status(201).json({ message: "Manual lead added successfully.", request: { ...request, _id: request.id } });
  } catch (error) {
    console.error("createManualLead error:", error);
    res.status(500).json({ message: "Failed to add manual lead." });
  }
};

const getStats = async (req, res) => {
  try {
    const pendingCountRec = await priceRequestRepository.db('price_requests').where({ status: "pending" }).count('id as count').first();
    const myAssignedCountRec = await priceRequestRepository.db('price_requests').where({ assigned_to: req.user.id }).count('id as count').first();
    
    res.status(200).json({ 
        pendingCount: parseInt(pendingCountRec.count, 10), 
        myAssignedCount: parseInt(myAssignedCountRec.count, 10) 
    });
  } catch (error) {
    console.error("getStats error:", error);
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

const getAssignedRequests = async (req, res) => {
  try {
    const requests = await priceRequestRepository.db('price_requests')
      .where({ assigned_to: req.user.id })
      .leftJoin('properties', 'price_requests.property_id', 'properties.id')
      .leftJoin('users', 'price_requests.user_id', 'users.id')
      .orderBy('price_requests.assigned_at', 'desc')
      .orderBy('price_requests.updated_at', 'desc')
      .select(
          'price_requests.*',
          'properties.name as propertyName', 'properties.address as propertyAddress', 'properties.main_image as propertyMainImage',
          'users.name as userName', 'users.email as userEmail', 'users.phone as userPhone'
      );

    const formattedRequests = requests.map(r => ({
        ...r,
        _id: r.id,
        property: { _id: r.property_id, name: r.propertyName, address: r.propertyAddress, mainImage: r.propertyMainImage },
        user: { _id: r.user_id, name: r.userName, email: r.userEmail, phone: r.userPhone }
    }));

    res.status(200).json({ requests: formattedRequests });
  } catch (error) {
    console.error("getAssignedRequests error:", error);
    res.status(500).json({ message: "Failed to fetch assigned leads." });
  }
};

const requestConversion = async (req, res) => {
  try {
    const request = await priceRequestRepository.findOne({
      id: req.params.id,
      assigned_to: req.user.id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found or you do not have permission to convert it.",
      });
    }

    if (request.conversion_status !== "none") {
      return res.status(400).json({
        message: `Conversion already ${request.conversion_status}. Cannot re-submit.`,
      });
    }

    const updatedRequest = await priceRequestRepository.update(request.id, { conversion_status: "pending_approval" });

    res.status(200).json({
      message: "Conversion request submitted. Awaiting admin approval.",
      request: { ...updatedRequest, _id: updatedRequest.id },
    });
  } catch (error) {
    console.error("requestConversion error:", error);
    res.status(500).json({ message: "Failed to submit conversion request." });
  }
};

const updatePipeline = async (req, res) => {
  try {
    const { pipelineStage, priority, clientPreferences } = req.body;

    const request = await priceRequestRepository.findOne({
      id: req.params.id,
      assigned_to: req.user.id,
    });

    if (!request) {
      return res.status(404).json({ message: "Request not found or you do not have permission." });
    }

    const updates = {};
    if (pipelineStage) updates.pipeline_stage = pipelineStage;
    if (priority) updates.priority = priority;
    if (clientPreferences) {
      updates.client_preferences = {
        ...(request.client_preferences || {}),
        ...clientPreferences,
      };
    }

    const updatedRequest = await priceRequestRepository.update(request.id, updates);

    res.status(200).json({ message: "Pipeline updated successfully.", request: { ...updatedRequest, _id: updatedRequest.id } });
  } catch (error) {
    console.error("updatePipeline error:", error);
    res.status(500).json({ message: "Failed to update pipeline." });
  }
};

module.exports = {
  createRequest,
  createManualLead,
  getStats,
  getAssignedRequests,
  requestConversion,
  updatePipeline,
};
