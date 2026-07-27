const express = require("express");
const router  = express.Router();

const { protect }        = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const { getMyTeam, getSellerTasks, getMySales, convertUnitAction } = require("./sellerController");
const { getTeamOverview, broadcastToTeam } = require("./delegationController");
const notificationRepository = require("../../repositories/NotificationRepository");


const sellerGuard = [protect, authorizeRoles("seller")];


router.get("/my-team", sellerGuard, getMyTeam);


router.get("/tasks", sellerGuard, getSellerTasks);


router.get("/my-sales", sellerGuard, getMySales);


router.put("/units/:id/convert", sellerGuard, convertUnitAction);


router.get("/team-overview", sellerGuard, getTeamOverview);


router.post("/broadcast", sellerGuard, broadcastToTeam);


router.get("/notifications", sellerGuard, async (req, res) => {
    try {
        const notificationsRaw = await notificationRepository.db('notifications')
            .where({ recipient_id: req.user.id, read: false })
            .orderBy('created_at', 'desc')
            .limit(50)
            .leftJoin('users', 'notifications.sender_id', 'users.id')
            .select('notifications.*', 'users.name as senderName');

        const notifications = notificationsRaw.map(n => ({
            ...n,
            _id: n.id,
            recipientId: n.recipient_id,
            senderId: { _id: n.sender_id, name: n.senderName }
        }));

        res.status(200).json({ notifications });
    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({ message: "Failed to fetch notifications." });
    }
});


router.put("/notifications/mark-read", sellerGuard, async (req, res) => {
    try {
        await notificationRepository.db('notifications')
            .where({ recipient_id: req.user.id, read: false })
            .update({ read: true });
            
        res.status(200).json({ message: "All notifications marked as read." });
    } catch (error) {
        console.error("markRead error:", error);
        res.status(500).json({ message: "Failed to mark notifications." });
    }
});

module.exports = router;
