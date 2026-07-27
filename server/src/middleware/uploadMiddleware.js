const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");


const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
      public_id: (_req, file) => {
        const name = file.originalname
          .replace(/\.[^.]+$/, "")
          .replace(/\s+/g, "_");
        return `${Date.now()}_${name}`;
      },
    },
  });


const wrapMulter = (upload) => (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("[wrapMulter] MulterError:", err.message);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    if (err) {
      console.error("[wrapMulter] Upload/Cloudinary error:", err);
      return res.status(400).json({ message: err.message || "File upload failed." });
    }
    next();
  });
};


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


const _bannerUpload = multer({
  storage: makeStorage("apartment/banners"),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only images allowed.")),
}).array("images", 10);

const uploadBannerImages = wrapMulter(_bannerUpload);


const _bannerMediaUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: (_req, file) => ({
      folder: "apartment/banners",
      resource_type: "auto", 
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif", "gif", "mp4", "webm", "mov"],
      public_id: `${Date.now()}_${file.originalname
        .replace(/\.[^.]+$/, "")
        .replace(/\s+/g, "_")}`,
    }),
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");
    if (isImage || isVideo) return cb(null, true);
    cb(new Error("Only image or video files are allowed."));
  },
}).fields([
  { name: "desktopMedia", maxCount: 1 },
  { name: "mobileMedia",  maxCount: 1 },
]);

const uploadBannerMedia = wrapMulter(_bannerMediaUpload);


const _propertyUpload = multer({
  storage: makeStorage("apartment/properties"),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith("image/")
      ? cb(null, true)
      : cb(new Error("Only image files are allowed (JPG, PNG, WebP, AVIF, GIF)."))
}).fields([
  { name: "mainImage",   maxCount: 1  },
  { name: "extraImages", maxCount: 10 },
  { name: "progressImages", maxCount: 10 },
]);

const uploadPropertyImages = wrapMulter(_propertyUpload);


const _documentUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "apartment/documents",
      
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
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only images (JPG/PNG/WebP) and PDF files are allowed."));
  },
}).single("document"); 

const uploadDocumentFile = wrapMulter(_documentUpload);


const _invoiceUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "apartment/invoices",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      public_id: (_req, file) => {
        const name = file.originalname.replace(/\.[^.]+$/, "").replace(/\s+/g, "_");
        return `invoice_${Date.now()}_${name}`;
      },
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only images (JPG/PNG/WebP) and PDF files are allowed for invoices."));
  },
}).single("invoice"); 

const uploadInvoice = wrapMulter(_invoiceUpload);

module.exports = {
  uploadAvatar,
  uploadBannerImages,
  uploadBannerMedia,
  uploadPropertyImages,
  uploadDocumentFile,
  uploadInvoice,
};
