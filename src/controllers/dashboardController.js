const dashboardRepository = require('../repositories/dashboardRepository');

exports.getDashboardSummary = async (req, res) => {
    try {
        const firmDbPool = req.firmDbPool;
        const summary = await dashboardRepository.getDashboardSummary(firmDbPool);
        res.status(200).json({success: true, data: summary});
    } catch (err) {
        console.error('Error fetching dashboard summary:', err);
        res.status(500).json({success: false, message: 'Internal Server Error'});
    }
};