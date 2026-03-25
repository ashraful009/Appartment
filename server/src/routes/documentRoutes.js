const express = require("express");
const router  = express.Router();

const { protect }                                  = require("../middleware/authMiddleware");
const { uploadDocumentFile }                       = require("../middleware/uploadMiddleware");
const { uploadDocument, getMyDocuments, deleteDocument } = require("../controllers/documentController");

// GET    /api/documents       — list my documents
router.get("/",     protect, getMyDocuments);

// POST   /api/documents       — upload a new document
router.post("/",    protect, uploadDocumentFile, uploadDocument);

// DELETE /api/documents/:id   — delete a document (owner or admin)
router.delete("/:id", protect, deleteDocument);

module.exports = router;
