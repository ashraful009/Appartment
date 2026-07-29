const express = require("express");
const router  = express.Router();

const { protect }        = require("../../middleware/authMiddleware");
const { authorizeRoles } = require("../../middleware/authMiddleware");
const { uploadBannerImages, uploadBannerMedia, uploadPropertyImages } = require("../../middleware/uploadMiddleware");

const {
    getStats,
    getUsers,
    getUserById,
    updateUserRoles,
    getAdminPendingRequests,
    getSellersList,
    assignRequest,
    getSellersPerformance,
    getConversionStats,
    approveConversion,
    rejectConversion,
    rejectSellerConversion,
    getSellerAnalytics,
    approveSellerConversion,
    getCandidateSuperiors,
} = require("./adminController");
const { createBanner, getBanners, getBannerById, updateBanner, deleteBanner } = require("../catalog/bannerController");
const { createProperty, getProperties, updateProperty, deleteProperty, getPropertyUnits } = require("../catalog/propertyController");
const { getIdleLeads, setMonthlyTarget } = require("./adminEngineController");
const {
    listMemberships,
    getMembershipDetail,
    createBookingForUser,
    getPaymentTracking,
    getInstallmentDueDay,
    setInstallmentDueDay,
    getPropertiesForMembership,
} = require("./adminMembershipController");
const {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
} = require("../catalog/projectController");

const adminGuard = [protect, authorizeRoles("admin")];


router.get("/stats", adminGuard, getStats);


router.get("/users", adminGuard, getUsers);
router.get("/candidate-superiors", adminGuard, getCandidateSuperiors);
router.get("/users/:id", adminGuard, getUserById);
router.put("/users/:id/roles", adminGuard, updateUserRoles);


router.get("/banners",         adminGuard, getBanners);
router.get("/banners/:id",     adminGuard, getBannerById);
router.post("/banners",        adminGuard, uploadBannerMedia, createBanner);
router.put("/banners/:id",     adminGuard, uploadBannerMedia, updateBanner);
router.delete("/banners/:id",  adminGuard, deleteBanner);


router.post("/properties", adminGuard, uploadPropertyImages, createProperty);
router.get("/properties", adminGuard, getProperties);

router.get("/properties/:id/units", adminGuard, getPropertyUnits);
router.put("/properties/:id", adminGuard, uploadPropertyImages, updateProperty);
router.delete("/properties/:id", adminGuard, deleteProperty);



router.get("/requests/pending", adminGuard, getAdminPendingRequests);


router.get("/sellers-list", adminGuard, getSellersList);


router.put("/requests/:id/assign", adminGuard, assignRequest);


router.get("/sellers-performance", adminGuard, getSellersPerformance);
router.get("/conversion-stats", adminGuard, getConversionStats);
router.put("/requests/:id/approve-conversion", adminGuard, approveConversion);
router.put("/requests/:id/reject-conversion", adminGuard, rejectConversion);



router.get("/seller-analytics", adminGuard, getSellerAnalytics);


router.put("/requests/:id/approve-seller-conversion", adminGuard, approveSellerConversion);


router.put("/requests/:id/reject-seller-conversion", adminGuard, rejectSellerConversion);



router.get("/idle-leads", adminGuard, getIdleLeads);


router.post("/targets", adminGuard, setMonthlyTarget);


const { getPipelineFunnel, getLeadSources, getGenealogyTree, getTeamLeaderboard } = require("./analyticsController");


router.get("/analytics/pipeline-funnel", adminGuard, getPipelineFunnel);


router.get("/analytics/lead-sources", adminGuard, getLeadSources);


router.get("/analytics/genealogy-tree", adminGuard, getGenealogyTree);


router.get("/analytics/team-leaderboard", adminGuard, getTeamLeaderboard);




router.get("/memberships/properties-list", adminGuard, getPropertiesForMembership);
router.get("/memberships", adminGuard, listMemberships);
router.get("/memberships/:membershipId", adminGuard, getMembershipDetail);
router.post("/memberships", adminGuard, createBookingForUser);


router.get("/payment-tracking", adminGuard, getPaymentTracking);


router.get("/settings/installment-due-day", adminGuard, getInstallmentDueDay);
router.put("/settings/installment-due-day", adminGuard, setInstallmentDueDay);


router.get("/projects", adminGuard, getProjects);
router.post("/projects", adminGuard, uploadPropertyImages, createProject);
router.put("/projects/:id", adminGuard, uploadPropertyImages, updateProject);
router.delete("/projects/:id", adminGuard, deleteProject);

module.exports = router;

