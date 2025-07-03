module.exports = {
  USER_NOT_LOGGED_IN: {
    code: 'USER_NOT_LOGGED_IN',
    message: 'You must be logged in',
    statusCode: 401,
  },
  NO_FIRMS_FOR_USER: {
    code: 'NO_FIRMS_FOR_USER',
    message: 'There are no firms associated to the user',
    statusCode: 404,
  },
  PERMISSION_DENIED: {
    code: 'PERMISSION_DENIED',
    message: 'Forbidden: User doesn\'s have the permission to perform this action',
    statusCode: 403,
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
    statusCode: 401,
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'You are not authorized to access this resource',
    statusCode: 403,
  },
  FIRM_NOT_FOUND: {
    code: 'FIRM_NOT_FOUND',
    message: 'Selected firm does not exist',
    statusCode: 404,
  },
  UNIT_NOT_FOUND: {
    code: 'UNIT_NOT_FOUND',
    message: 'Selected Unit does not exist',
    statusCode: 404,
  },
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    message: 'Selected Category does not exist',
    statusCode: 404,
  },
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    message: 'Product not found',
    statusCode: 404,
  },
  PRODUCT_VARIANT_NOT_FOUND: {
    code: 'PRODUCT_VARIANT_NOT_FOUND',
    message: 'Product Varriant not found',
    statusCode: 404,
  },
  IMAGE_NOT_FOUND: {
    code: 'IMAGE_NOT_FOUND',
    message: 'Image not found',
    statusCode: 404,
  },
  No_FILES_TO_UPLOAD: {
    code: 'No_FILES_TO_UPLOAD',
    message: 'There are no files provided for upload',
    statusCode: 404,
  },
  FILE_NOT_DELETED: {
    code: 'FILE_NOT_DELETED',
    message: 'The file was not deleted from device',
    statusCode: 404,
  },
  PARTY_NOT_FOUND: {
    code: 'PARTY_NOT_FOUND',
    message: 'Selected party does not exist',
    statusCode: 404, 
  },
  TRANSACTION_NOT_FOUND: {
    code: 'TRANSACTION_NOT_FOUND',
    message: 'Selected transaction does not exist',
    statusCode: 404,
  },
  MISSING_REQUIRED_FIELDS: {
    code: 'MISSING_REQUIRED_FIELDS',
    message: 'Some of the required fields are missing',
    statusCode: 400
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    statusCode: 400,
  },
  DATABASE_ERROR: {
    code: 'DATABASE_ERROR',
    message: 'Database operation failed',
    statusCode: 500,
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'Something went wrong',
    statusCode: 500,
  }
};