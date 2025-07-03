
-- Firm-Specific Database

-- Firm-specific Database Schema

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
	description TEXT NOT NULL UNIQUE
);

-- Units
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
	abbreviation TEXT NOT NULL UNIQUE
);

-- Products  is_variant to has_variant
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    unit_id INTEGER REFERENCES units(id),
    has_variant BOOLEAN DEFAULT FALSE,
    maintain_stock BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Attributes
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Product Attribute Values
CREATE TABLE product_attribute_values (
    id SERIAL PRIMARY KEY,
    attribute_id INTEGER REFERENCES product_attributes(id),
    value TEXT NOT NULL
);

-- Product Variants
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    sku TEXT,
    barcode TEXT,
    price NUMERIC(12, 2),
    cost_price NUMERIC(12, 2),
	opening_stock Integer DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
	low_stock_threshold Integer DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Product Variant Attribute Values
CREATE TABLE product_variant_attributes (
    id SERIAL PRIMARY KEY,
    variant_id INTEGER REFERENCES product_variants(id),
    attribute_name_id INTEGER REFERENCES product_attributes(id),
    attribute_value_id INTEGER REFERENCES product_attribute_values(id)
);

-- Product Images
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    file_name TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
	uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parties store multiple phone no.
CREATE TABLE parties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
	--location TEXT,
    address TEXT,
    gstin TEXT,
	type TEXT NOT NULL CHECK (type IN ('customer', 'supplier')),
	opening_balance Numeric,
	balance_type TEXT CHECK (balance_type IN ('payable', 'receivable')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by Integer,
	last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT NOT NULL,
    party_id INTEGER REFERENCES parties(id),
    type TEXT CHECK (type IN ('sale', 'purchase', 'sale_return', 'purchase_return')) NOT NULL,
    payment_type TEXT CHECK (payment_type IN ('cash', 'credit')),
	total_amount NUMERIC(12,2) DEFAULT 0,
    packing_charges NUMERIC(12,2) DEFAULT 0,
    forwarding_charges NUMERIC(12,2) DEFAULT 0,
	note TEXT,
	created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finalized_at TIMESTAMP
);

-- Draft Invoices
CREATE TABLE draft_invoices (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id),
    type TEXT CHECK (type IN ('sale', 'purchase', 'sale_return', 'purchase_return')) NOT NULL,
    note TEXT,
	created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id),
    variant_id INTEGER REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
    rate NUMERIC(12, 2) NOT NULL,
	--total_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Draft Invoice Items
CREATE TABLE draft_invoice_items (
    id SERIAL PRIMARY KEY,
    draft_invoice_id INTEGER REFERENCES draft_invoices(id),
    variant_id INTEGER REFERENCES product_variants(id),
    quantity INTEGER NOT NULL,
	rate NUMERIC(12, 2) NOT NULL,
	total_amount NUMERIC(12,2) NOT NULL
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Party Transactions
CREATE TABLE party_transactions (
    id SERIAL PRIMARY KEY,
    party_id INTEGER REFERENCES parties(id),
    invoice_id INTEGER REFERENCES invoices(id),
    type TEXT CHECK (type IN ('payment', 'receipt', 'sale', 'purchase', 'sale_return', 'purchase_return')) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    mode TEXT CHECK (mode IN ('cash', 'bank', 'upi', 'cheque', 'other')),
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_to TEXT,
    mode TEXT,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Adjustments
CREATE TABLE inventory_adjustments (
    id SERIAL PRIMARY KEY,
	invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id),
    change_qty INTEGER NOT NULL, -- positive for in, negative for out
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--Reserved Stock for draft_invoices
CREATE TABLE reserved_stocks (
    id SERIAL PRIMARY KEY,
    draft_invoice_id INTEGER REFERENCES draft_invoices(id) ON DELETE CASCADE,
	invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    variant_id INTEGER,
    reserved_qty NUMERIC(10, 2)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE invoice_counters (
	id SERIAL PRIMARY KEY,
	type TEXT CHECK (type IN ('sale', 'purchase', 'sale_return', 'purchase_return')) NOT NULL,
	last_number INTEGER DEFAULT 0,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(type)
);

--INDEX
CREATE INDEX idx_reserved_variant ON reserved_stocks(product_variant_id);
CREATE INDEX idx_reserved_draft ON reserved_stocks(draft_invoice_id);