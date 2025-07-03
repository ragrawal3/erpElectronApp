-- Insert parties (Customers and Suppliers)
INSERT INTO parties (id, name, type, opening_balance, created_at, last_updated_at)
VALUES
(1, 'Alpha Traders', 'customer', 1000, NOW(), NOW()),
(2, 'Beta Suppliers', 'supplier', -2000, NOW(), NOW());

-- Insert invoices (assume invoice_id used in transactions)
INSERT INTO invoices (id, invoice_number, party_id, type, created_at)
VALUES
(1, 'INV-1001', 1, 'sale', NOW()),
(2, 'INV-1002', 2, 'purchase', NOW());

-- Insert party_transactions
--  Type 'invoice' = money owed (receivable/payable)
--  Type 'payment' = money paid or received
--  All values are positive, direction inferred by party type

INSERT INTO party_transactions (id, party_id, type, invoice_id, amount, mode, created_at )
VALUES
-- Customer Invoice (Receivable)
(1, 1, 'sale', 1, 3000, NULL, NOW()),
-- Customer Payment (Inflow)
(2, 1, 'payment', NULL, 2000, 'cash', NOW()),

-- Supplier Invoice (Payable)
(3, 2, 'sale', 2, 4000, NULL, NOW()),
-- Supplier Payment (Outflow)
(4, 2, 'receipt', NULL, 2500, 'cash', NOW());

-- Additional customer payment via cash (Cashbook Inflow)
INSERT INTO party_transactions (id, party_id, type, amount, mode, created_at)
VALUES
(5, 1, 'payment', 1000, 'cash', NOW());

-- Insert expenses (Cashbook Outflow)
INSERT INTO expenses (id, title, amount, mode, created_at)
VALUES
(1, 'Stationery', 300, 'cash', NOW()),
(2, 'Electricity Bill', 800, 'cash', NOW());