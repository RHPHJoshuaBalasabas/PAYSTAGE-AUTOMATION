function categorizeSettlementRows(data) {
    return data.reduce((acc, row) => {
        const settlementType = row['Settlement Type']?.trim().toLowerCase();
        const description = row['Description']?.trim().toLowerCase();

        // Switch case to categorize rows
        switch (true) {
            case (description === 'approved transactions'):
                acc.approvedTransactions.push(row);
                break;
            case (description === 'refund transaction'):
                acc.refundTransactions.push(row);
                break;
            case (description === 'cb transaction'):
                acc.cbTransactions.push(row);
                break;
            case (settlementType === 'rr return'):
                acc.rrReturn.push(row);
                break;
            case (settlementType === 'credit adjustment'):
                acc.creditAdjustment.push(row);
                break;
            case (settlementType === 'total'):
                acc.total.push(row);
                break;

            //deductions
            case (settlementType === 'mdr fee'):
                acc.mdrFee.push(row);
                break;
            case (settlementType === 'fixed fee'):
                acc.fixedFee.push(row);
                break;
            case (settlementType === 'refund fee'):
                acc.refundFee.push(row);
                break;
            case (settlementType === 'cb fee'):
                acc.cbFee.push(row);
                break;
            case (settlementType === 'retrieval fee'):
                acc.retrievalFee.push(row);
                break;
            case (settlementType === 'rolling reserve'):
                acc.rollingReserve.push(row);
                break;
            case (settlementType === 'other fees'):
                acc.otherFees.push(row);
                break;
            case (settlementType === 'total deductions'):
                acc.totalDeductions.push(row);
                break;
            case (settlementType === 'total amount (net of fees)'):
                acc.totalNetofFees.push(row);
                break;
            case (settlementType === 'settlement fee'):
                acc.settlementFee.push(row);
                break;
            case (settlementType === 'total settled amount'):
                acc.totalSettledAmount.push(row);
                break;
            default:
                break;
        }

        return acc;
    }, {
        totalNetofFees: [], total: [], approvedTransactions: [], refundTransactions: [],
        cbTransactions: [], rrReturn: [], creditAdjustment: [], mdrFee: [], fixedFee: [],
        refundFee: [], cbFee: [], retrievalFee: [], rollingReserve: [], otherFees: [],
        totalDeductions: [], settlementFee: [], totalSettledAmount: []
    });
}

module.exports = { categorizeSettlementRows };