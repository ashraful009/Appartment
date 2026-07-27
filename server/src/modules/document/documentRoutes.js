const express = require("express");
const router  = express.Router();

const { protect }                                  = require("../../middleware/authMiddleware");
const { uploadDocumentFile }                       = require("../../middleware/uploadMiddleware");
const { uploadDocument, getMyDocuments, deleteDocument } = require("./documentController");


router.get("/",     protect, getMyDocuments);


router.post("/",    protect, uploadDocumentFile, uploadDocument);


router.delete("/:id", protect, deleteDocument);

module.exports = router;
