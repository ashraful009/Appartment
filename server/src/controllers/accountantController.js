const ApartmentUnit = require("../models/ApartmentUnit");
const Installment   = require("../models/Installment");

// ─────────────────────────────────────────────────────────────────────────────
// Helper — round to 2 decimal places (avoids floating-point dust)
// ─────────────────────────────────────────────────────────────────────────────
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get sold or booked units (for Accountant's list page)
// @route   GET /api/accountant/units
// @access  Private (Accountant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update unit details with specs & financials.
//          When isDocumentReady transitions to true:
//            1. Auto-generates "Booking Money" & "Down Payment" installments.
//            2. Calculates the monthly EMI and persists it on the unit.
// @route   PUT /api/accountant/units/:id/details
// @access  Private (Accountant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateUnitDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { specs, financials } = req.body;

    // ── 1. Fetch the unit ───────────────────────────────────────────────────
    const unit = await ApartmentUnit.findById(id);
    if (!unit) {
      return res.status(404).json({ message: "Unit not found" });
    }

    // ── 2. Apply specs ──────────────────────────────────────────────────────
    if (specs) {
      unit.specs = specs;
    }

    // ── 3. Apply financials & derive totalPayable ───────────────────────────
    if (financials) {
      const fieldsToSum = [
        "unitPrice",
        "bookingMoney",
        "downPayment",
        "parkingCharge",
        "financialServiceCharge",
        "latePaymentPenalty",
        "serviceCharge",
      ];

      let totalPayable = 0;
      fieldsToSum.forEach((field) => {
        if (financials[field]) totalPayable += Number(financials[field]);
      });

      unit.financials = { ...financials, totalPayable };
    }

    // ── 4. Only do installment work on the FIRST time isDocumentReady is set ─
    const wasAlreadyReady = unit.isDocumentReady;
    unit.isDocumentReady = true;

    const updatedUnit = await unit.save();

    // ── 5. Auto-generate initial installments (idempotent guard) ────────────
    if (!wasAlreadyReady && unit.customerId && unit.financials) {
      const fin = unit.financials;

      const parking          = Number(fin.parkingCharge          || 0);
      const financialService = Number(fin.financialServiceCharge  || 0);
      const serviceCharge    = Number(fin.serviceCharge           || 0);
      const unitPrice        = Number(fin.unitPrice               || 0);
      const bookingMoney     = Number(fin.bookingMoney            || 0);
      const downPayment      = Number(fin.downPayment             || 0);

      const now = new Date();

      // ── 5a. Booking Money installment (status: Paid — already collected) ──
      const bookingInstallment = new Installment({
        unitId:          unit._id,
        customerId:      unit.customerId,
        installmentName: "Booking Money",
        chargeBreakdown: {
          baseAmount:       bookingMoney,
          parking:          0,
          financialService: 0,
          serviceCharge:    0,
        },
        latePenalty:  0,
        totalAmount:  bookingMoney,
        invoiceDate:  now,
        dueDate:      now,          // already collected at booking time
        status:       "Unpaid",
      });

      // ── 5b. Down Payment installment (status: Paid — collected on agreement) ──
      const downPaymentInstallment = new Installment({
        unitId:          unit._id,
        customerId:      unit.customerId,
        installmentName: "Down Payment",
        chargeBreakdown: {
          baseAmount:       downPayment,
          parking:          0,
          financialService: 0,
          serviceCharge:    0,
        },
        latePenalty:  0,
        totalAmount:  downPayment,
        invoiceDate:  now,
        dueDate:      now,
        status:       "Unpaid",
      });

      await Promise.all([
        bookingInstallment.save(),
        downPaymentInstallment.save(),
      ]);

      // ── 5c. Calculate EMI ────────────────────────────────────────────────
      //
      // Total cost the customer carries:
      //   Unit Price + Parking + Financial Service + Service Charge
      //
      // Already paid up-front:
      //   Booking Money + Down Payment
      //
      // Remaining balance split across 184 monthly EMIs.
      //
      const totalCost       = unitPrice + parking + financialService + serviceCharge;
      const alreadyPaid     = bookingMoney + downPayment;
      const remainingBalance = totalCost - alreadyPaid;

      const emiAmount = remainingBalance > 0 ? round2(remainingBalance / 184) : 0;

      // Persist EMI info back onto the unit
      await ApartmentUnit.findByIdAndUpdate(unit._id, {
        emiAmount,
        remainingEmis: 184,
      });

      return res.status(200).json({
        message: "Unit details updated & installments initialised",
        unit: updatedUnit,
        installmentsCreated: 2,
        emiAmount,
        remainingEmis: 184,
        remainingBalance: round2(remainingBalance),
      });
    }

    // ── 6. Already-ready path: just return the updated unit ─────────────────
    res.status(200).json({
      message: "Unit details updated successfully",
      unit: updatedUnit,
    });
  } catch (error) {
    console.error("Error updating unit details:", error);
    res.status(500).json({ message: "Server error updating unit details" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all installments / payments (for Accountant's payment page)
// @route   GET /api/accountant/installments
// @access  Private (Accountant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const getAllPayments = async (req, res) => {
  try {
    const installments = await Installment.find({ installmentName: { $ne: "SYSTEM_GEN" } }) // ignore any system ones if they exist
      .populate({
        path: "unitId",
        select: "unitName propertyId",
        populate: { path: "propertyId", select: "name" },
      })
      .populate("customerId", "name email phone")
      .sort({ updatedAt: -1 });

    res.status(200).json(installments);
  } catch (error) {
    console.error("Error fetching installments:", error);
    res.status(500).json({ message: "Server error fetching installments" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update a specific installment (e.g. mark as Paid)
// @route   PUT /api/accountant/installments/:id/status
// @access  Private (Accountant, Admin)
// ─────────────────────────────────────────────────────────────────────────────
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Unpaid", "Pending", "Paid", "Overdue"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const installment = await Installment.findById(id);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }

    installment.status = status;
    await installment.save();

    res.status(200).json({
      message: "Installment status updated",
      installment,
    });
  } catch (error) {
    console.error("Error updating installment status:", error);
    res.status(500).json({ message: "Server error updating status" });
  }
};

module.exports = {
  getSoldUnits,
  updateUnitDetails,
  getAllPayments,
  updatePaymentStatus,
};
