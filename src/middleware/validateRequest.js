module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        errorCode: 'VALIDATION_ERROR',
        errors: error.details.map((e) => e.message)
      });
    }
    req.validatedBody = value;
    next();
  };
};