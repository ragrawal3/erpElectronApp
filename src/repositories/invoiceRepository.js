const errorCodes = require('../constants/errorCodes');

exports.createInvoice = async (db, data) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        const {
          party_id, type, payment_type, total_amount,
          packing_charges, forwarding_charges, note, created_by, items
        } = data;

        let invoice, query;
        const invoice_number = await this.generateInvoiceNumber(client, type);

        query = `
          INSERT INTO invoices (
            invoice_number, party_id, type, payment_type, total_amount,
            packing_charges, forwarding_charges, note, created_by
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *;
        `;
      
        var values = [
          invoice_number, party_id, type, payment_type, total_amount,
          packing_charges || 0, forwarding_charges || 0, note, created_by
        ];
        var result = await client.query(query, values);
        invoice = result.rows[0];

        result = await this.insertInvoiceItems(client, invoice.id, items);
        
        await this.reCalculateInvoiceTotal(client, invoice.id, invoice.total_amount);
        
        invoice = {...invoice,
            items: result};
        await client.query('COMMIT');
        return invoice;
    } catch(err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.insertInvoiceItems = async (db, invoice_id, items) => {
    const itemValues = [];
    const itemmPlaceholders = [];
    const rStockValues = [];
    const rStockPlaceholders = [];

    const productSelectQuery = `
        SELECT p.maintain_stock 
        FROM products p JOIN product_variants pv ON pv.product_id = p.id
        WHERE pv.id = $1;`;

    const itemSelectQuery = `
        SELECT * FROM invoice_items
        WHERE invoice_id = $1 AND variant_id = $2;`;

    const itemUpdateQuery = `
        UPDATE invoice_items SET 
            quantity = $1
        WHERE invoice_id = $2 AND variant_id = $3 RETURNING *;`;

    const rStockSelectQuery = `
        SELECT * from reserved_stocks
        WHERE invoice_id = $1 
            AND variant_id = $2;`;

    const rStockUpdateQuery = `
        UPDATE reserved_stocks SET 
            reserved_qty = $1
        WHERE invoice_id = $2 AND variant_id = $3;`;
    
    var item, oldItem, rStock, j=0, result, itemUpdateResult, maintain_stock, currentStock;
    for (var i=0; i<(items.length); i++) {
        item = items[i];    
        if(item.total_amount != (item.quantity * item.rate).toFixed(2)) {
            console.log('Invoce item (' + item.id + ') submited total as: ' + item.total_amount + ', but actual total amount is: ' + (item.quantity * item.rate).toFixed(2));
            item.total_amount = (item.quantity * item.rate).toFixed(2);
        }

        maintain_stock = await db.query(productSelectQuery, [item.variant_id]);

        // check if product_variant alreday in invoice_items
        oldItem = await db.query(itemSelectQuery, [invoice_id, item.variant_id]);
        if (oldItem.rowCount>0 && parseFloat(oldItem.rows[0].rate) === parseFloat(item.rate)) {
            console.log(oldItem.rows[0].rate + ', ' +item.rate);
            // if same item exist increase the quantity for existing invoice_item, provided rate is same for old and new
            result = await db.query(itemUpdateQuery, [(parseFloat(oldItem.rows[0].quantity) + item.quantity), invoice_id, item.variant_id]);
            itemUpdateResult = {... itemUpdateResult, ...result.rows[0]};
            if (maintain_stock.rows[0].maintain_stock) {
                console.log('Yaha Aya');
                // check for existing reserved_stock and increment the quantity
                rStock = await db.query(rStockSelectQuery, [invoice_id, item.variant_id]);
                if (rStock.rowCount>0) {
                    await db.query(rStockUpdateQuery, [(parseFloat(rStock.rows[0].reserved_qty) + item.quantity), invoice_id, item.variant_id]);
                }
    
                // validating if item_quantity and reserved_stock are same
                if (oldItem.rows[0].quantity !== rStock.rows[0].reserved_qty) { 
                    console.log('Missmatch: item_quantity-' + oldItem.rows[0].quantity + ', reserved_stock-' + rStock.rows[0].reserved_qty +
                                ' for invoice_id-' + invoice_id + ', invoice_item_id-' + oldItem.id);
                }
            }
        } else {
            // if product_item not alreday in invoice_item then insert a new reccord
            const idx = j * 5;
            itemmPlaceholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5})`);
            itemValues.push(invoice_id, item.variant_id, item.quantity, item.rate, item.total_amount);

            if (maintain_stock) {
                const idz = j * 3;
                rStockPlaceholders.push(`($${idz + 1}, $${idz + 2}, $${idz + 3})`);
                rStockValues.push(invoice_id, item.variant_id, item.quantity);
                j++;
            }
        }
    }

    const itemInsertQuery = `
        INSERT INTO invoice_items (
            invoice_id, variant_id, quantity, rate, amount) 
        VALUES ${itemmPlaceholders.join(', ')} RETURNING *`;
    
    if (itemValues.length>0) {
        const itemInsertResult = await db.query(itemInsertQuery, itemValues);
    }
    
    if (rStockValues.length != 0) {
        const rStockInsertquery = `
           INSERT INTO reserved_stocks (
               invoice_id, variant_id, reserved_qty)
           VALUES ${rStockPlaceholders.join(', ')}`;
        await db.query(rStockInsertquery, rStockValues);
    }
    
    if (typeof itemInsertResult !== 'undefined') {
        return {...itemUpdateResult, ...itemInsertResult.rows[0]};
    } else {
        return {...itemUpdateResult};
    }
};

exports.deleteInvoiceItems = async (db, invoice_id, items) => {
    const itemQuery = `
        DELETE FROM invoice_items ii 
        WHERE ii.id = $1;`;

    const rStockSelectQuery = `
        SELECT * from reserved_stocks
        WHERE invoice_id = $1 
            AND variant_id = $2;`;

    const rStockUpdateQuery = `
        UPDATE reserved_stocks
        SET reserved_qty = $1
        WHERE invoice_id = $2 
            AND variant_id = $3;`;
    
    const rStockDeleteQuery = `
        DELETE FROM reserved_stocks rs
        WHERE rs.invoice_id = $1 
            AND rs.variant_id = $2;`;

    let deleteCheck, rStock;

    for (const item of items) {
        deleteCheck = await db.query(itemQuery, [item.id]);
        if (deleteCheck.rowCount > 0) {
            rStock = await db.query(rStockSelectQuery, [invoice_id, item.variant_id]);
            if (rStock.rows[0].reserved_qty===item.quantity) {
                await db.query(rStockDeleteQuery, [invoice_id, item.variant_id]);
            } else {
                await db.query(rStockUpdateQuery, [(rStock.rows[0].reserved_qty-item.quantity), invoice_id, item.variant_id]);
            }
        }
    }
    //ToDo possible error when we have multiple items for same variant_id
};

exports.updateInvoiceItems = async (db, invoice_id, items) => {
    const productSelectQuery = `
        SELECT p.maintain_stock 
        FROM products p JOIN product_variants pv ON pv.product_id = p.id
        WHERE pv.id = $1;`;

    const itemSelectQuery = `
        Select * FROM invoice_items
        WHERE id = $1;`;

    const itemUpdateQuery = `
        UPDATE invoice_items SET 
            variant_id = $1, quantity = $2, rate = $3, amount = $4
        WHERE id = $5 RETURNING *;`;
    
    const rStockSelectQuery = `
        SELECT * from reserved_stocks
        WHERE invoice_id = $1 
            AND variant_id = $2;`;

    const rStockUpdateQuery = `
        UPDATE reserved_stocks SET 
            reserved_qty = $1
        WHERE invoice_id = $2 AND variant_id = $3;`;
    
    const rStockInsertQuery = `
        INSERT INTO reserved_stocks 
            (invoice_id, variant_id, reserved_qty) 
        VALUES ($1, $2, $3);`;

    const rStockDeleteQuery = `
        DELETE FROM reserved_stocks
        WHERE invoice_id = $1 AND variant_id = $2;`;

    var oldItem, updatedItems, rStock, result, maintain_stock;
    for (const item of items) {
        
        if(item.total_amount != (item.quantity * item.rate).toFixed(2)) {
            console.log('Invoce item (' + item.id + ') submited total as: ' + item.total_amount + ', but actual total amount is: ' + (item.quantity * item.rate).toFixed(2));
            item.total_amount = (item.quantity * item.rate).toFixed(2);
        }

        maintain_stock = await db.query(productSelectQuery, [item.variant_id]);
        oldItem = await db.query(itemSelectQuery, [item.id]);
        result = await db.query(itemUpdateQuery, [item.variant_id, item.quantity, item.rate, item.total_amount, item.id]);
        
        if (maintain_stock.rows[0].maintain_stock && parseInt(oldItem.rows[0].variant_id) === item.variant_id) {    
            rStock = await db.query(rStockSelectQuery, [invoice_id, item.variant_id]);
            if (rStock.rowCount>0) {
                await db.query(rStockUpdateQuery, [( parseFloat(rStock.rows[0].reserved_qty) - parseFloat(oldItem.rows[0].quantity) + item.quantity ), invoice_id, item.variant_id]);
                // validating if item_quantity and reserved_stock are same
                if (oldItem.rows[0].quantity !== rStock.rows[0].reserved_qty) { 
                    console.log('Missmatch: item_quantity-' + oldItem.rows[0].quantity + ', reserved_stock-' + rStock.rows[0].reserved_qty +
                                ' for invoice_id-' + invoice_id + ', invoice_item_id-' + oldItem.id);
                }
            } else {
                await db.query(rStockInsertQuery, [invoice_id, item.variant_id, item.quantity]);
            }
        } else {
            // update reserver_stock for oldItem
            rStock = await db.query(rStockSelectQuery, [invoice_id, oldItem.rows[0].variant_id]);
            if (rStock.rows[0].reserved_qty === oldItem.rows[0].quantity) {
                await db.query(rStockDeleteQuery, [invoice_id, oldItem.rows[0].variant_id]);
            } else {
                await db.query(rStockUpdateQuery, [( parseFloat(rStock.rows[0].reserved_qty) - parseFloat(oldItem.rows[0].quantity)), invoice_id, item.variant_id]);
            }
            // update reserve_stock for newItem
            if(maintain_stock.rows[0].maintain_stock) {
                await db.query(rStockInsertQuery, [invoice_id, item.variant_id, item.quantity]);
            }
        }
        updatedItems = { ...updatedItems, ...result.rows[0] };
    }
    return updatedItems;
    //ToDo possible error when we have multiple items for same variant_id
};

exports.alterInvoiceDetails = async (db, invoice_id, data) => {
    const { party_id, type, payment_type, total_amount,
          packing_charges, forwarding_charges, note, items} = data;
    
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const fields = [];
        const values = [];
        let idx = 1;

        if (typeof party_id !== 'undefined') {
            fields.push(`party_id = $${idx++}`);
            values.push(party_id);
        }
        if (typeof type !== 'undefined') {
            fields.push(`type = $${idx++}`);
            values.push(type);
        }
        if (typeof payment_type !== 'undefined') {
            fields.push(`payment_type = $${idx++}`);
            values.push(payment_type);
        }
        if (typeof total_amount !== 'undefined') {
            fields.push(`total_amount = $${idx++}`);
            values.push(total_amount);
        }
        if (typeof packing_charges !== 'undefined') {
            fields.push(`packing_charges = $${idx++}`);
            values.push(packing_charges);
        }
        if (typeof forwarding_charges !== 'undefined') {
            fields.push(`forwarding_charges = $${idx++}`);
            values.push(forwarding_charges);
        }
        if (typeof note !== 'undefined') {
            fields.push(`note = $${idx++}`);
            values.push(note);
        }
        
        // 1. Update invoice details
        if (fields.length > 0) {
            fields.push(`last_updated = CURRENT_TIMESTAMP`);
            var invoice = await client.query(
                `UPDATE invoices SET ${fields.join(', ')} WHERE id = $${idx}`,
                [...values, invoice_id]
            );
        }

        // var invoice = await client.query(`
        //     UPDATE invoices SET 
        //         party_id = $1, type = $2, payment_type = $3, total_amount = $4,
        //         packing_charges = $5, forwarding_charges = $6, note = $7, last_updated = CURRENT_TIMESTAMP
        //     WHERE id = $8 RETURNING *;`,
        //         [party_id, type, payment_type, total_amount,
        //         packing_charges, forwarding_charges, note, invoice_id]);
        
        // 2. Process items: add / update / delete
        var add = [];
        var update = [];
        if (items.add.length > 0) { 
            add = await this.insertInvoiceItems(client, invoice_id, items.add);
        }
        if (items.update.length > 0) { 
            update = await this.updateInvoiceItems(client, invoice_id, items.update);
        }
        if (items.delete.length > 0) { 
            await this.deleteInvoiceItems(client, invoice_id, items.delete);
        }

        invoice = {
            ...invoice.rows[0],
            "add" : add,
            "update": update
        }
        
        await this.reCalculateInvoiceTotal(client, invoice_id);
        await client.query('COMMIT');
        return invoice;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.finalizeInvoice = async (db, invoice_id, data) => {
    const { party_id, type, payment_type, total_amount,
          packing_charges, forwarding_charges, note, items, payments} = data;
    const client = await db.connect();

    const productSelectQuery = `
        SELECT p.maintain_stock 
        FROM products p JOIN product_variants pv ON pv.product_id = p.id
        WHERE pv.id = $1;`;
        
    const itemSelectQuery = `
        Select * FROM invoice_items
        WHERE invoice_id = $1;`;

    const inventoryInsertQuery = `
        INSERT INTO inventory_adjustments
            (invoice_id, variant_id, change_qty, change_reason)
        VALUES ($1, $2, $3, $4)`;

    const partyTransInsertQuery = `
        INSERT INTO party_transactions
            (party_id, invoice_id, type, amount, mode, note)
        VALUES ($1, $2, $3, $4, $5, $6)`;
    
    const rStockDeleteQuery = `
        DELETE FROM reserved_stocks rs
        WHERE rs.invoice_id = $1;`;
    
    const invoiceUpdateQuery = `
        UPDATE invoices SET 
            note = $1, last_updated = CURRENT_TIMESTAMP, finalized_at = CURRENT_TIMESTAMP
        WHERE id = $2`;
        
    try {
        await client.query("BEGIN");

        // 1. Update invoice details if any changes made
        if (items.add.length > 0 || items.update.length > 0 || items.delete.length > 0) { this.alterInvoiceDetails(db, invoice_id, data); }
        
        // 2. adjust inventory stock
        const invoice = await client.query(invoiceSelectQuer, [invoice_id]);
        const latestItems = await client.query(itemSelectQuery, [invoice_id]);
        for (const item of latestItems.rows[0]) {
        
            if(item.quantity ==0 || item.rate ==0) {
                throw new error ('item has zero value associated to quantity or rate');
            }

            maintain_stock = await client.query(productSelectQuery, [item.variant_id]);
            if (maintain_stock.rows[0]) {
                if(type === 'sale' || type === 'purchase_return') {
                    await client.query(inventoryInsertQuery, [invoice_id, item.variant_id, -item.quantity, type]);
                } else if(type === 'purchase' || type === 'sale_return') {
                    await client.query(inventoryInsertQuery, [invoice_id, item.variant_id, item.quantity, type]);
                }
            }
        }

        // 3. update party transactions
        await client.query(partyTransInsertQuery, [party_id, invoice_id, type, total_amount, null, null]);

        if(payment_type === 'cash' && payments.length>0) {
            for (const payment of payments) {
                await client.query(partyTransInsertQuery, [party_id, invoice_id, 'receipt', payment.amount, payment.mode, (payment.note || 'Invoice partial payment') ]);
            }
        }

        // 4. release the reserved_stocks
        await client.query(rStockDeleteQuery, [invoice_id]);

        // 5. recalculate total_amount for invoice
        await this.reCalculateInvoiceTotal(client, invoice.id);

        // 6. set invoice as finalised
        await client.query(invoiceUpdateQuery, [note, invoice_id])
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.getInvoiceById = async (db, invoice_id) => {
    var query = `SELECT i.* FROM invoices i WHERE i.id = $1;`;
    var result = await db.query(query, [invoice_id]);
    const invoiceDetails = result.rows[0];

    query = `SELECT p.* FROM invoices i JOIN parties p ON i.party_id = p.id WHERE i.id = $1;`;
    result = await db.query(query, [invoice_id]);
    const partyDetails = result.rows[0];

    query = `
        SELECT ii.*, string_agg(av.value, ', ') AS variant
            FROM invoice_items ii 
            JOIN product_variants pv on ii.variant_id = pv.id
            JOIN products pr ON pv.product_id = pr.id
            JOIN product_variant_attributes va ON pv.id = va.variant_id 
            JOIN product_attributes a ON a.id = va.attribute_name_id
            JOIN product_attribute_values av ON av.id = va.attribute_value_id
            WHERE ii.invoice_id = $1 
            GROUP BY va.variant_id, ii.id;
    `;
    result = await db.query(query, [invoice_id]);
    
    const items = { items: result.rows.map(row => (
            row
        ))};

        result = Object.assign({}, {invoiceDetails}, {partyDetails}, items);
        return result;
};

exports.getInvoices = async ({ type, party_id, offset, limit }, db) => {
    const params = [];
    let whereClauses = [];

    if (type) {
        params.push(type);
        whereClauses.push(`i.type = $${params.length}`);
    }

    if (party_id) {
        params.push(party_id);
        whereClauses.push(`i.party_id = $${params.length}`);
    }

    const whereClause = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Main query
    const query = `
    SELECT 
        i.id, i.invoice_number, i.type, i.payment_type,
        i.total_amount, i.finalized_at,
        p.name AS party_name
    FROM invoices i
    JOIN parties p ON i.party_id = p.id
    ${whereClause}
    ORDER BY i.created_at DESC
    LIMIT $${params.length + 1}
    OFFSET $${params.length + 2}
    `;

    const countQuery = `
    SELECT COUNT(*) AS total
    FROM invoices i
    ${whereClause}
    `;

    const result = await db.query(query, [...params, limit, offset]);
    const countRes = await db.query(countQuery, params);
    const total = parseInt(countRes.rows[0].total);

    return {
        invoices: result.rows,
        total
    };
};

exports.generateInvoiceNumber = async (db, type) => {
    const result = await db.query(`
        INSERT INTO invoice_counters (type, last_number)
        VALUES ($1, 1)
        ON CONFLICT (type)
        DO UPDATE SET last_number = invoice_counters.last_number + 1
        RETURNING last_number;`, [type]);

    const prefix = {
        sale: 'S',
        purchase: 'P',
        sale_return: 'SR',
        purchase_return: 'PR'
    }[type] || 'INV';

    return `${prefix}-${(String(result.rows[0].last_number)).padStart(4, '0')}`;
};

exports.reCalculateInvoiceTotal = async (db, invoice_id, total_amount) => {
    // Recalculate invoice total
    const totalRow = await db.query(
        `SELECT 
            COALESCE(SUM(amount), 0) AS items_total 
        FROM invoice_items 
        WHERE invoice_id = $1`,
        [invoice_id]);

    const itemsTotal = parseFloat(totalRow.rows[0].items_total || 0);

    // Get updated packing/forwarding (fallback to 0)
    const invoiceRow = await db.query(
        `SELECT packing_charges, forwarding_charges 
        FROM invoices 
        WHERE id = $1`,
        [invoice_id]);

    const packingCharges = Number(invoiceRow.rows[0].packing_charges) || 0;
    const forwardingCharges = Number(invoiceRow.rows[0].forwarding_charges) || 0;

    const newTotal = parseFloat((itemsTotal + packingCharges + forwardingCharges).toFixed(2));
        
    if (total_amount != newTotal) {
        await db.query(
            `UPDATE invoices SET total_amount = $1 WHERE id = $2`,
            [newTotal, invoice_id]);
        console.log('Invoice (' + invoice_id + ') submited total_amount as: ' + total_amount + ', but actual total amount is: ' + newTotal);
    }
};

exports.fetchCurrentStock = async (db, variant_id) => {
    var query = `SELECT current_stock FROM product_variants WHERE id = $1;`;
    var result = await db.query(query, [variant_id]);
    var stock = {"current_stock" : result.rows[0]};
    query = `SELECT COALESCE(SUM(reserved_qty), 0) FROM reserved_stocks WHERE variant_id = $1;`;
    result = await db.query(query, [variant_id]);
    stock = {...stock, "reserved_stock" : result.rows[0]};
    return stock
};