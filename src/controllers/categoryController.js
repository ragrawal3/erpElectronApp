const categoryRepository = require('../repositories/categoryRepository');

exports.getAllCategories = async (req, res) => {
  const categories = await categoryRepository.getAllCategories(req.firmDbPool);
  res.status(200).json({success: true, message: 'List of all Categories', categories});
};

exports.createCategory = async (req, res) => {
  const newCategory = await categoryRepository.createCategory(req.firmDbPool, req.body);
  res.status(201).json({success: true, message: 'Untis created successfully', newCategory});
};

exports.updateCategory = async (req, res) => {
  const updatedCategory = await categoryRepository.updateCategory(req.firmDbPool, req.params.id, req.body);
  if (updatedCategory) {
    res.status(200).json({success: true, message: 'Untis updated successfully', updatedCategory});
  }
  else {
    throw {...errorCodes.CATEGORY_NOT_FOUND};
  }
};

exports.deleteCategory = async (req, res) => {
  const deletedCategory = await categoryRepository.deleteCategory(req.firmDbPool, req.params.id);
  if (deletedCategory) {
    res.status(200).json({success: true, message: 'Category deleted successfully' });
  } else {
    throw {...errorCodes.CATEGORY_NOT_FOUND};
  }
};