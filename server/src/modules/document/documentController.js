const cloudinary = require("../../config/cloudinary");
const documentRepository = require("../../repositories/DocumentRepository");





const uploadDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    if (!title) {
      return res.status(400).json({ message: "Document title is required." });
    }

    const fileUrl  = req.file.path;
    const publicId = req.file.filename;

    const document = await documentRepository.create({
      user_id:  req.user.id,
      title,
      file_url: fileUrl,
      public_id: publicId,
    });

    const formattedDoc = {
        _id: document.id,
        user: document.user_id,
        title: document.title,
        fileUrl: document.file_url,
        publicId: document.public_id,
        uploadedAt: document.uploaded_at
    };

    res.status(201).json({
      success:  true,
      message:  "Document uploaded successfully.",
      document: formattedDoc,
    });
  } catch (error) {
    console.error("uploadDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to upload document." });
  }
};





const getMyDocuments = async (req, res) => {
  try {
    const documents = await documentRepository.db('documents')
      .where({ user_id: req.user.id })
      .orderBy('uploaded_at', 'desc');

    const formattedDocs = documents.map(doc => ({
        _id: doc.id,
        user: doc.user_id,
        title: doc.title,
        fileUrl: doc.file_url,
        publicId: doc.public_id,
        uploadedAt: doc.uploaded_at
    }));

    res.status(200).json({ success: true, documents: formattedDocs });
  } catch (error) {
    console.error("getMyDocuments error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch documents." });
  }
};






const deleteDocument = async (req, res) => {
  try {
    const document = await documentRepository.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    const isOwner = document.user_id.toString() === req.user.id.toString();
    const isAdmin = req.user.roles?.includes("admin");

    if (!isOwner && !isAdmin) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this document." });
    }

    await cloudinary.uploader.destroy(document.public_id, {
      resource_type: "raw",
    });

    await documentRepository.delete(document.id);

    res
      .status(200)
      .json({ success: true, message: "Document deleted successfully." });
  } catch (error) {
    console.error("deleteDocument error:", error);
    res.status(500).json({ success: false, message: "Failed to delete document." });
  }
};

module.exports = { uploadDocument, getMyDocuments, deleteDocument };
