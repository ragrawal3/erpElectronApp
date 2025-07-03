const { createProductVariant } = require('./productVariantRepository');
const fs = require("fs");
const path = require("path");
const errorCodes = require('../constants/errorCodes');

exports.getAllProducts = async (db) => {
    const result = await db.query(`
        SELECT p.* AS P, c.name AS category_name, u.name AS unit_name,
            (Select file_name FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS primary_image,
            (SELECT COUNT(*) FROM product_variants pv WHERE pv.product_id = p.id) AS variant_count
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN units u ON p.unit_id = u.id
        ORDER BY p.created_at DESC;
        `);
    return result.rows;
};

exports.listProducts = async ({ search = '', categoryId = null, unitId = null, limit = 10, offset = 0 }, db) => {
    const query = `
        SELECT 
        p.id, p.name, c.name AS category, u.name AS unit,
        COUNT(pv.id) AS variant_count,
        COALESCE(SUM(pv.current_stock), 0) AS total_stock
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN units u ON p.unit_id = u.id
        LEFT JOIN product_variants pv ON pv.product_id = p.id
        WHERE p.name ILIKE $1
        AND ($2::int IS NULL OR p.category_id = $2)
        AND ($3::int IS NULL OR p.unit_id = $3)
        GROUP BY p.id, c.name, u.name
        ORDER BY p.name ASC
        LIMIT $4 OFFSET $5
    `;
    const values = [`%${search}%`, categoryId, unitId, limit, offset];
    const result = await db.query(query, values);
    return result.rows;
};

exports.getProductById = async (db, productId) => {
    const result = await db.query(`
        SELECT p.* AS P, c.name AS category_name, u.name AS unit_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN units u ON p.unit_id = u.id
        WHERE p.id = $1 ;`, [productId]);
    if (result.rows.length === 0) {
        throw {...errorCodes.PRODUCT_NOT_FOUND};
    }
    return result.rows;
};

exports.createProduct = async (db, data) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const result = await client.query(
            'INSERT INTO products (name, category_id, unit_id, has_variant, maintain_stock) VALUES ($1, $2, $3, $4, $5) RETURNING *;',
            [data.name, data.category_id, data.unit_id, data.has_variant, data.maintain_stock]
        );
        const productId = result.rows[0].id;
        
        for (const variant of data.variants) {
            await createProductVariant(true, client, productId, variant);
        }
        
        await client.query('COMMIT');
        return productId;
    } catch (err) {
        await client.query('ROLLBACK');
    } finally {
        await client.release();
    }
};

exports.updateProduct = async (db, productId, data) => {
    const result = await db.query(
        'UPDATE products SET name = $1, category_id = $2, unit_id = $3, has_variant = $4, maintain_stock = $5, last_updated = NOW() WHERE id = $6 RETURNING *;',
        [data.name, data.category_id, data.unit_id, data.has_variant, data.maintain_stock, productId]
    );
    if (result.length === 0) {
        throw {...errorCodes.PRODUCT_NOT_FOUND};
    }
    return result.rows;
};

exports.deleteProduct = async (db, productId) => {
    const client = await db.connect();
    try {
        client.query('BEGIN');
        
        const variantResult = await db.query('SELECT id FROM product_variants WHERE product_id = $1;', [productId]);
        
        if (variantResult.rowCount === 0) {
            throw {...errorCodes.PRODUCT_VARIANT_NOT_FOUND};
        }

        if (variantResult.rowCount > 0) {
            await db.query('DELETE FROM product_variant_attributes WHERE variant_id = ANY($1);', [variantResult.rows.map(v => v.id)]);
            await db.query('DELETE FROM product_variants WHERE product_id = $1;', [productId]);
        }
        
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *;', [productId]);
        
        client.query('COMMIT');
        return result.rows;
    } catch (err) {
        client.query('ROLLBACK');
    } finally {
        client.release();
    }
};

exports.getProductImages = async (db, productId) => {
    const result = await db.query('SELECT * FROM product_images WHERE product_id = $1;', [productId]);
    if (result.length === 0) {
        throw {...errorCodes.IMAGE_NOT_FOUND};
    }
    return result.rows;
};

exports.uploadProductImage = async (db, productId, files) => {
    if (!files || files.length === 0) {
        throw {...errorCodes.No_FILES_TO_UPLOAD};
    }
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const imageUrls = files.map((file, index) => ({
            productId: productId,
            filename: file.filename,
            is_primary: index === 0, // Assuming the first image is the primary image
        }));
        
        for (const image of imageUrls) {
            await client.query(
                'INSERT INTO product_images (product_id, file_name, is_primary) VALUES ($1, $2, $3)',
                [image.productId, image.filename, image.is_primary]
            );
        }
        await client.query('COMMIT');
        return imageUrls;
    } catch (err) {
        await client.query('ROLLBACK');
    } finally {
        client.release();
    }
};

exports.deleteProductImageById = async (db, productId, imageId) => {
    const client = await db.connect();
    try {
        const { rows } = await client.query(
            'Select file_name, is_primary FROM product_images WHERE id = $1 AND product_id = $2',
            [imageId, productId]
        );

        if (rows.length ===0) {
            throw {...errorCodes.IMAGE_NOT_FOUND}; 
        }

        const image = rows[0];

        // Delete file from disk
        const filepath = path.join(__dirname, "../uploads/products", image.file_name);
        console.log(filepath);
        fs.unlink(filepath, (err) => {
            if (err && err.code !== "ENOENT") throw {...errorCodes.FILE_NOT_DELETED}
        });

        // Delete from DB
        const result = await client.query("DELETE FROM product_images WHERE id = $1;", [imageId]);

        // If primary image was deleted, set a new one (if exists)
        if (image.is_primary) {
            await client.query(`
                WITH first_image AS 
                (SELECT id FROM product_images WHERE product_id = $1 ORDER BY id LIMIT 1)
                UPDATE product_images SET is_primary = TRUE WHERE id IN (SELECT id FROM first_image)
                `, [productId]);
        }

        client.query("COMMIT");
        return result;
    } catch (err) {
        client.query('ROLLBACK');
    } finally {
        client.release();
    }
};
