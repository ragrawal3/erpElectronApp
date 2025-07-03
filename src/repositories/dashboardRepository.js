exports.getDashboardSummary = async (firmDbPool) => {
    // ToDO add AND DATE(created_at) = CURRENT_DATE to every query
    const client =  await firmDbPool.connect();
    try {
        const result = {};
        // Total Sales
        const salesRes = await client.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total_sales
        FROM invoices
        WHERE type = 'sale'
        `);
        result.totalSales = Number(salesRes.rows[0].total_sales);

        // Total Purchases
        const purchaseRes = await client.query(`
        SELECT COALESCE(SUM(total_amount), 0) AS total_purchases
        FROM invoices
        WHERE type = 'purchase'
        `);
        result.totalPurchases = Number(purchaseRes.rows[0].total_purchases);

        // Receivables & Payables
        const balancesRes = await client.query(`
        SELECT
            p.id,
            p.type,
            p.opening_balance,
			Case
				When t.type = 'sale' Then COALESCE(SUM(t.amount), 0)
                When t.type = 'purchase' Then COALESCE(SUM(t.amount), 0)
				Else 0
				End AS total_sales_purchase,
			Case
				When t.type = 'receipt' Then COALESCE(SUM(t.amount), 0)
                When t.type = 'payment' Then COALESCE(SUM(t.amount), 0)
				Else 0
				End AS total_receipt_payments
	
        FROM parties p
        LEFT JOIN party_transactions t ON t.party_id = p.id
        GROUP BY p.id, t.type;
        `);

        let totalReceivables = 0;
        let totalPayables = 0;

        for (const row of balancesRes.rows) {
            const OB = Number(row.opening_balance)/2 || 0;
            const INV = Number(row.total_sales_purchase) || 0;
            const PAID = Number(row.total_receipt_payments) || 0;
            
            let balance = 0;
            
            if (row.type === 'customer') {
                balance = OB + INV - PAID;
                totalReceivables += balance;
            } else if (row.type === 'supplier') {
                balance = -OB - INV + PAID;
                totalPayables += balance;
            }
        }
        result.totalReceivables = Number(totalReceivables);
        result.totalPayables = Number(totalPayables);

        // Day Book Cash In/Out (real money flow)
        const cashRes = await client.query(`
        SELECT
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS cash_in,
            SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END) AS cash_out
        FROM (
            SELECT amount FROM party_transactions where mode = 'cash' and type = 'receipt'
			UNION ALL
			SELECT -amount FROM party_transactions where mode = 'cash' and type = 'payment'
            UNION ALL
            SELECT -amount FROM expenses where mode = 'cash' 
        ) AS cash_movements
        `);
        result.cashIn = Number(cashRes.rows[0].cash_in || 0);
        result.cashOut = Math.abs(cashRes.rows[0].cash_out || 0);

        return result;
    } finally {
    client.release();
  }
};