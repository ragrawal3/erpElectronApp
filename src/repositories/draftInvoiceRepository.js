const errorCodes = require('../constants/errorCodes');
const invoiceRepository = require('./invoiceRepository');

exports.createOrUpdateDraftInvoice = async (db, user_id, data) => {
    const client = await db.connect();
    await client.query('BEGIN');

    try{
        const { draft_id, party_id, type, payment_type, note, items = [] } = data;
        
        let draftInvoice, query;
        
        query = `INSERT INTO draft_invoices (party_id, type, payment_type, note, created_by)
                    VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
        draftInvoice = await db.query(query, [party_id, type, payment_type, note, user_id]);

        draftInvoice = draftInvoice.rows[0];

        // Insert each items in records and upadte the reserved_stocks aswell
        for (const item of items) {
            const { variant_id, quantity, rate, total } = item;

            query = `INSERT INTO draft_invoice_items (draft_invoice_id, variant_id, quantity, rate, total_amount)
                        VALUES ($1, $2, $3, $4, $5);`
            await db.query(query, [draftInvoice.id, variant_id, quantity, rate, total]);

            query = `INSERT INTO reserved_stocks (draft_invoice_id, variant_id, reserved_qty)
                        VALUES ($1, $2, $3);`
            await db.query(query, [draftInvoice.id, variant_id, quantity]);
        }

        await client.query('COMMIT');
        return draftInvoice.id;
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.getDraftInvoiceById = async (db, id) => {
    var query = `SELECT di.* FROM draft_invoices di WHERE id =$1;`
    var result = await db.query(query, [id]);
    const invoiceDetails = result.rows[0];

    query = `SELECT p.* FROM draft_invoices i JOIN parties p ON i.party_id = p.id WHERE i.id = $1;`;
    result = await db.query(query, [id]);
    const partyDetails = result.rows[0];

    query = `
        SELECT ii.id, ii.variant_id, ii.quantity, ii.rate, ii.total_amount,
                pv.sku AS variant_name, pr.name AS product_name
            FROM draft_invoice_items ii 
            JOIN product_variants pv on ii.variant_id = pv.id
            JOIN products pr ON pv.product_id = pr.id
            WHERE ii.draft_invoice_id = $1;
    `;
    result = await db.query(query, [id]);
    
    const items = { items: result.rows.map(row => (
            row
    ))};

    result = Object.assign({}, {invoiceDetails}, {partyDetails}, items);
    
    return result;

};

exports.updateDraftInvoiceById = async (db, inv_id, data, user_id) => {
    const client = await db.connect();
    await client.query('BEGIN');

    try{
        //ToDo after building forntend selective update/insert/delete is triggered and will be handeled accordingly
        await client.query('COMMIT');
        return draftInvoice.id;
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.finalizeDraftInvoice = async (db, draft_id, user_id) => {
    const client = await db.connect();
    var query, result;
    
    try {
        await client.query('BEGIN');

        query = `SELECT * FROM draft_invoices WHERE id = $1;`
        result = await client.query(query, [draft_id]);
        const draftInvoice = result.rows[0]; 

        query = `SELECT ii.* AS items FROM draft_invoice_items ii WHERE ii.draft_invoice_id = $1`
        result = await client.query(query, [draft_id]);
        const draftInvoiceItems = {items : result.rows};

        //1. Create Invoice
        const invoice_number = await invoiceRepository.generateInvoiceNumber(client, draftInvoice.type);
        console.log(invoice_number);
        const invoiceData = {
            ...draftInvoice,
            invoice_number: invoice_number,
            ...draftInvoiceItems
        }
        console.log(invoiceData);
        const invoice = await invoiceRepository.createInvoice(client, invoiceData);
        
        //3. ToDo Adjust Stock
        await adjustStockAfterDraftInvoiceFinalization(client, invoice.id);

        //4. Delete draftInvoice
        query = `DELETE FROM draft_invoice_items WHERE draft_invoice_id = $1;`;
        await db.query(query, [draft_id]);

        query = `DELETE FROM draft_invoices WHERE id = $1;`;
        await db.query(query, [draft_id]);
        // reserved_stock is automatically deleted.

        await client.query('COMMIT');
        return draftInvoice.id;
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

async function adjustStockAfterDraftInvoiceFinalization (client, invoice_id) {
    var result = await client.query(
    `SELECT id, type FROM invoices WHERE id = $1`,
    [invoice_id]
    );
    //if (invoiceRes.rows.length === 0) throw new Error('Invoice not found');

    const invoice = result.rows[0];
    const { type } = invoice;

    result = await client.query(
    `SELECT variant_id, quantity FROM invoice_items WHERE invoice_id = $1`,
    [invoice_id]
    );

    for (const item of result.rows) {
        const { variant_id, quantity } = item;

        // Determine stock change
        let change = 0;
        if (type === 'sale' || type === 'purchase_return') {
            change = -quantity;
        } else if (type === 'purchase' || type === 'sale_return') {
            change = +quantity;
        } else {
            throw new Error(`Unsupported invoice type: ${type}`);
        }

        // Update stock_quantity in product_variants
        await client.query(
            `UPDATE product_variants SET current_stock = current_stock + $1 WHERE id = $2`,
            [change, variant_id]
        );

        // Insert into inventory_adjustments
        await client.query(
            `INSERT INTO inventory_adjustments (invoice_id, variant_id, change_qty, change_reason) VALUES ($1, $2, $3)`,
            [invoice_id, variant_id, change, type]
        );
    }
}