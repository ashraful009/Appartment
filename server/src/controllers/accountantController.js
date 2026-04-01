const ApartmentUnit = require("../models/ApartmentUnit");

// @desc    Get sold or booked units
// @route   GET /api/accountant/units
// @access  Private (Accountant, Admin)
const getSoldUnits = async (req, res) => {
  try {
    const units = await ApartmentUnit.find({ status: { $in: ["Sold", "Booked"] } })
      .populate("propertyId")
      .populate("actionBy")
      .sort({ updatedAt: -1 });

    res.status(200).json(units);
  } catch (error) {
    console.error("Error fetching sold units:", error);
    res.status(500).json({ message: "Server error fetching units" });
  }
};

// @desc    Update unit details with specs and financials
// @route   PUT /api/accountant/units/:id/details
// @access  Private (Accountant, Admin)
const updateUnitDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { specs, financials } = req.body;

    const unit = await ApartmentUnit.findById(id);

    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    if (specs) {
      unit.specs = specs;
    }

    if (financials) {
      // Calculate totalPayable by summing relevant financial fields
      let totalPayable = 0;
      const fieldsToSum = [
        "unitPrice",
        "bookingMoney",
        "downPayment",
        "parkingCharge",
        "financialServiceCharge",
        "latePaymentPenalty",
        "serviceCharge",
      ];
      
      fieldsToSum.forEach((field) => {
        if (financials[field]) {
          totalPayable += Number(financials[field]);
        }
      });

      unit.financials = {
        ...financials,
        totalPayable,
      };
    }

    unit.isDocumentReady = true;

    const updatedUnit = await unit.save();

    res.status(200).json({
      message: "Unit details updated successfully",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Error updating unit details:", error);
    res.status(500).json({ message: "Server error updating unit details" });
  }
};

module.exports = {
  getSoldUnits,
  updateUnitDetails,
};
