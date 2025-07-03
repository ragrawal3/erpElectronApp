const errorCodes = require('../constants/errorCodes');
const unitRepository = require('../repositories/unitRepository');

exports.getAllUnits = async (req, res) => {
  const Unit = await unitRepository.getAllUnits(req.firmDbPool);
  res.status(200).json({success: true, message: 'List of all Untis', Unit});
};

exports.createUnit = async (req, res) => {
  const newUnit = await unitRepository.createUnit(req.firmDbPool, req.body);
  res.status(201).json({success: true, message: 'Unit created successfully', newUnit});
};

exports.updateUnit = async (req, res) => {
  const updatedUnit = await unitRepository.updateUnit(req.firmDbPool, req.params.id, req.body);
  if (updatedUnit) {
    res.status(200).json({success: true, message: 'Unit updated successfully', updatedUnit});
  }
  else {
    throw {...errorCodes.UNIT_NOT_FOUND};
  }
};

exports.deleteUnit = async (req, res) => {
  const deletedUnit = await unitRepository.deleteUnit(req.firmDbPool, req.params.id);
  if (deletedUnit) {
    res.status(200).json({success: true, message: 'Unit deleted successfully' });
  } else {
    throw {...errorCodes.UNIT_NOT_FOUND};
  }
};