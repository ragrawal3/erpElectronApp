exports.getAttributeNameValue = async (db) => {
    const result = await db.query(`
        SELECT a.id AS attribute_name_id, a.name AS attribute_name, av.id AS attribute_value_id, av.value AS attribute_value
        FROM product_attributes a
        JOIN product_attribute_values av ON av.attribute_id = a.id
        `);
    return result.rows;
};


exports.getVariantsForProduct = async (db, productId) => {
    const result = await db.query(`
        Select v.* AS PA, JSON_AGG(JSON_BUILD_OBJECT('name', a.name, 'value', av.value)) AS attributes
        From product_variants v 
        LEFT JOIN product_variant_attributes va ON v.id = va.variant_id 
        LEFT JOIN product_attributes a ON a.id = va.attribute_name_id
        LEFT JOIN product_attribute_values av ON av.id = va.attribute_value_id
        WHERE product_id = $1 GROUP BY v.id ORDER BY created_at DESC`,
        [productId]
    );
    return result.rows;
};

exports.createProductVariant = async (isConnected, db, product_id, variant) => {
    
    if (!isConnected)  { var client = await db.connect(); } else { var client = db;}

    try {
        if (!isConnected)  { await client.query('BEGIN'); }
        const variantResult = await client.query(
            'INSERT INTO product_variants (product_id, sku, barcode, price, cost_price, opening_stock, current_stock, low_stock_threshold) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;',
            [product_id, variant.sku, variant.barcode, variant.price, variant.cost_price, variant.opening_stock, variant.opening_stock, variant.low_stock_threshold]
        );
        const variant_id = variantResult.rows[0].id;
        
        if (variant.is_variant) {
            for (const attr of variant.attributes) {
                const attributeResult = await client.query(
                    'INSERT INTO product_variant_attributes (variant_id, attribute_name_id, attribute_value_id) VALUES ($1, $2, $3) RETURNING *;',
                    [variant_id, attr.attribute_name_id, attr.attribute_value_id]
                );
            }
        }
        
        if (!isConnected)  { await client.query('COMMIT'); };
        return variantResult.rows[0];
    } catch (err) {
        await client.query('ROLLBACK');
    } finally {
        if (!isConnected) { client.release(); }
    }
};


exports.updateProductVariant = async (db, variantId, data) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const variantResult = await client.query(
            'UPDATE product_variants SET sku = $1, barcode = $2, price = $3, cost_price = $4, opening_stock = $5, current_stock = $6, low_stock_threshold = $7, last_updated = NOW() WHERE id = $8 RETURNING *;',
            [data.sku, data.barcode, data.price, data.cost_price, data.opening_stock, data.current_stock, data.low_stock_threshold, variantId]
        );

        if (variantResult.length === 0) {
            throw new Error('Product variant not found');
        }

        await client.query('DELETE FROM product_variant_attributes WHERE variant_id = $1', [variantId]);
        
        for (const attr of data.attributes) {
            await client.query(
                'INSERT INTO product_variant_attributes (variant_id, attribute_name_id, attribute_value_id) VALUES ($1, $2, $3);',
                [variantId, attr.attribute_name_id, attr.attribute_value_id]
            );
        }
        await client.query('COMMIT');
        return variantResult.rows[0];
    }
    catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating product variant:', err);
        throw new Error('Internal Server Error');
    }
    finally {
        client.release();
    }
};
