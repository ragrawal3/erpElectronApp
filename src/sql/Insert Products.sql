-- 1. Units
INSERT INTO units (name, abbreviation) VALUES
('Piece', 'pc'),
('Kilogram', 'kg'),
('Litre', 'ltr');

-- 2. Product Categories
INSERT INTO categories (name, description) VALUES
('Clothing', 'Apparel and garments'),
('Groceries', 'Daily essentials and food items');

-- 3. Products
INSERT INTO products (name, category_id, unit_id, has_variant, maintain_stock) VALUES
('T-Shirt', 1, 1, true, true),
('Jeans', 1, 1, true, true),
('Sugar', 2, 2, false, true);

-- 4. Product Attributes
INSERT INTO product_attributes (name) VALUES
('Color'),
('Size');

-- 4. Product Attributes Values
INSERT INTO product_attribute_values (attribute_id, value) VALUES
(1,'Red'),
(1,'Blue'),
(2,'M'),
(2,'L'),

-- 5. Product Variants (each row is a unique variant of a product)
-- T-Shirt (ID = 1), Jeans (ID = 2), Sugar (ID = 3)
INSERT INTO product_variants (product_id, sku, barcode, price, cost_price, opening_stock, current_stock, low_stock_threshold) VALUES
(1, 'TSHIRT-RD-M', 'TSH001', 300, 200, 10, 10, 5),  -- Red Medium
(1, 'TSHIRT-BL-L', 'TSH002', 320, 210, 8, 8, 5),  -- Blue Large
(2, 'JEANS-BL-M', 'JNS001', 1200, 900, 5, 5, 3),
(3, 'SUGAR-1KG', 'SGR001', 50, 40, 100, 100, 10);

-- 6. Product Variant Attributes
-- Match variant_id with product_variants
INSERT INTO product_variant_attributes (variant_id, attribute_name_id, attribute_value_id) VALUES
(1, 1, 1),
(1, 2, 3),
(2, 1, 2),
(2, 2, 4),
(3, 1, 2),
(3, 2, 3);

-- 7. Stock (same as opening_stock above but to track in/out over time)
INSERT INTO inventory_adjustments (variant_id, quantity, change_type, change_reason, created_at) VALUES
(1, 10, 'in', 'Opening Stock', NOW()),
(2, 8, 'in', 'Opening Stock', NOW()),
(3, 5, 'in', 'Opening Stock', NOW()),
(4, 100, 'in', 'Opening Stock', NOW());