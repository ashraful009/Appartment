const { sendError } = require("../responses/apiResponse");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return sendError(res, error.errors, "Validation failed", 400);
  }
};

module.exports = { validate };
