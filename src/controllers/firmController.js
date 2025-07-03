const firmRepository = require('../repositories/firmRepository');
const { sendSuccess } = require('../utils/sendResponse');
const sucessCodes = require('../constants/successCodes');
const errorCodes = require('../constants/errorCodes');


exports.createNewFirm = async (req, res, next) => {
    const { name, address, contact_email, contact_phone, logo_url, gst, state } = req.body;
    const userId = req.session.user.id;
    
    //firm database name
    const db_name = `firm_${name.toLowerCase().replace(/\s+/g, '_')}`;

    // ToDo: Check if the firm already exists
    try {
        const firmDetails = await firmRepository.createNewFirm(req.masterDbPool, req.body, userId, db_name);
        
        if (!firmDetails || firmDetails.rows.length === 0) {
            throw {...errorCodes.PRODUCT_NOT_FOUND,
                message: 'Firm creation failed',
            };
        }

        const firmId = firmDetails.rows[0].id;
        sendSuccess(res, sucessCodes.FIRM_CREATED, firmId)
    } catch (err) {
        next(err);
    }
}


exports.selectFirm = async (req, res, next) => {
    try {
        const masterdb = req.masterDbPool;
        const { firm_id } = req.body;
        const user_id = req.session.user?.id;

        console.log( user_id + ", " + firm_id);

        const userRoleResult = await firmRepository.getUserRoleForFirm(masterdb, user_id, firm_id);

        if(userRoleResult.rows.length === 0) {
            throw {...errorCodes.UNAUTHORIZED};
        }

        const userRole = userRoleResult.rows[0].role;

        const firmDetails = await firmRepository.getFirmDetails(masterdb, firm_id);
        if (!firmDetails || firmDetails.rows.length === 0) {
            throw {...errorCodes.FIRM_NOT_FOUND};
        }
        req.session.firm = {
            id: firmDetails.rows[0].id,
            dbName: firmDetails.rows[0].db_name,
            role: userRole
        };
        sendSuccess(res, sucessCodes.FIRM_SELECTED)
    } catch (err) {
        next(err);
    }
}
