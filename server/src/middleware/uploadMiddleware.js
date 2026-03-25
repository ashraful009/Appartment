const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// ─── Helper: build a CloudinaryStorage for a given folder ────────────────────
const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      public_id: (_req, file) => {
        const name = file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/\s+/g, "_");
        return `${Date.now()}_${name}`;
      },
    },
  });

// ─── Helper: wrap multer to work with Express 5 (no next as middleware arg) ──
const wrapMulter = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// ── 1. Avatar (single, 2 MB, face-crop 400×400) ──────────────────────────────
const _avatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "apartment/avatars",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
      public_id: (_req, file) => {
        const name = file.originalname.replace(/\.[^.]+$/, "").replace(/\s+/g, "_");
        return `avatar_${Date.now()}_${name}`;
      },
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only images allowed.")),
}).single("avatar");

const uploadAvatar = wrapMulter(_avatarUpload);

// ── 2. Banner images (multiple, field: "images", max 10, 5 MB each) ──────────
const _bannerUpload = multer({
  storage: makeStorage("apartment/banners"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only images allowed.")),
}).array("images", 10);

const uploadBannerImages = wrapMulter(_bannerUpload);

// ── 3. Property images (mainImage single + extraImages multiple, max 10) ─────
const _propertyUpload = multer({
  storage: makeStorage("apartment/properties"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only images allowed.")),
}).fields([
  { name: "mainImage",   maxCount: 1  },
  { name: "extraImages", maxCount: 10 },
]);

const uploadPropertyImages = wrapMulter(_propertyUpload);

// ── 4. Customer documents (single file: images OR PDF, max 10 MB) ────────────
const _documentUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "apartment/documents",
      // Allow both images and PDFs; Cloudinary needs resource_type raw for non-image
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      public_id: (_req, file) => {
        const name = file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/\s+/g, "_");
        return `doc_${Date.now()}_${name}`;
      },
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only images (JPG/PNG/WebP) and PDF files are allowed."));
  },
}).single("document"); // frontend must use field name "document"

const uploadDocumentFile = wrapMulter(_documentUpload);

module.exports = { uploadAvatar, uploadBannerImages, uploadPropertyImages, uploadDocumentFile };
