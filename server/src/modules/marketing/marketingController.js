const { v4: uuidv4 } = require("uuid");
const userRepository = require("../../repositories/UserRepository");
const priceRequestRepository = require("../../repositories/PriceRequestRepository");

const generateLink = async (req, res) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ message: "propertyId is required." });
    }

    const slug = uuidv4();

    await userRepository.db('lead_links').insert({
      id: uuidv4(),
      seller_id: req.user.id,
      property_id: propertyId,
      slug,
    });

    res.status(201).json({ 
      message: "Marketing link generated successfully.", 
      slug 
    });
  } catch (error) {
    console.error("generateLink error:", error);
    res.status(500).json({ message: "Failed to generate marketing link." });
  }
};

const submitLinkLead = async (req, res) => {
  try {
    const { slug } = req.params;
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required." });
    }

    const linkRecord = await userRepository.db('lead_links').where({ slug }).first();
    if (!linkRecord) {
      return res.status(404).json({ message: "Invalid marketing link." });
    }

    const requestData = {
      property_id: linkRecord.property_id,
      user_id: null,
      guest_name: name.trim(),
      guest_phone: phone.trim(),
      status: "assigned",
      assigned_to: linkRecord.seller_id,
      current_holder_id: linkRecord.seller_id,
      assigned_at: new Date(),
      source: "marketing_link"
    };

    const request = await priceRequestRepository.create(requestData);

    res.status(201).json({ message: "Lead submitted successfully.", request: { ...request, _id: request.id } });
  } catch (error) {
    console.error("submitLinkLead error:", error);
    res.status(500).json({ message: "Failed to submit lead." });
  }
};

const getLinkDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    const linkRecord = await userRepository.db('lead_links')
      .where({ slug })
      .first();

    if (!linkRecord) {
      return res.status(404).json({ message: "Invalid marketing link." });
    }

    const property = await userRepository.db('properties')
      .where({ id: linkRecord.property_id })
      .first();

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    const seller = await userRepository.db('users').where({ id: linkRecord.seller_id }).first();

    res.status(200).json({ 
      property,
      sellerName: seller?.name || "Our Agent"
    });
  } catch (error) {
    console.error("getLinkDetails error:", error);
    res.status(500).json({ message: "Failed to fetch link details." });
  }
};

module.exports = {
  generateLink,
  submitLinkLead,
  getLinkDetails,
};
