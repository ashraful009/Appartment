const express = require("express");
const router  = express.Router();

const { protect }        = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/authMiddleware");
const { getMyTeam, getSellerTasks, getMySales, convertUnitAction } = require("../controllers/sellerController");
const { getTeamOverview, broadcastToTeam } = require("../controllers/delegationController");
const Notification = require("../models/Notification");

// Seller-only guard
const sellerGuard = [protect, authorizeRoles("seller")];

// GET /api/seller/my-team — sub-seller affiliates referred by this seller
router.get("/my-team", sellerGuard, getMyTeam);

// GET /api/seller/tasks — today's and overdue follow-up tasks
router.get("/tasks", sellerGuard, getSellerTasks);

// GET /api/seller/my-sales — Get all units handled by this seller
router.get("/my-sales", sellerGuard, getMySales);

// PUT /api/seller/units/:id/convert — Convert units from self book to customer sold
router.put("/units/:id/convert", sellerGuard, convertUnitAction);

// GET /api/seller/team-overview — mentor view of all sub-sellers + earnings
router.get("/team-overview", sellerGuard, getTeamOverview);

// POST /api/seller/broadcast — send a message to all sub-sellers
router.post("/broadcast", sellerGuard, broadcastToTeam);

// GET /api/seller/notifications — fetch unread notifications for the logged-in seller
router.get("/notifications", sellerGuard, async (req, res) => {
    try {
        const notifications = await Notification.find({
            recipientId: req.user._id,
            read: false,
        })
            .populate("senderId", "name")
            .sort({ createdAt: -1 })
            .limit(50);

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});

// PUT /api/seller/notifications/mark-read — mark all notifications as read
router.put("/notifications/mark-read", sellerGuard, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("markRead error:", error);
        res.status(500).json({ message: "Failed to mark notifications." });
    }
});

module.exports = router;



