import TransactionPageTest from '../../pages/transactionPage';

const transactions = new TransactionPageTest();
export const fetchTransactionData =
    (rowCount, processed_date, transaction_number, merchant_number, merchant_name, customer_name, type, method, vendor, solution, status, amount, net_amount) => {
    transactions[processed_date](rowCount)
    .invoke('text').then((processedDate) => {
        Cypress.env('processed_date', processedDate.trim());
    });
    
    transactions[transaction_number](rowCount)
    .invoke('text').as('transaction_number');

    transactions[merchant_number](rowCount)
    .invoke('text').then((merchantNumber) => {
        Cypress.env('merchant_number', merchantNumber.trim());
    });

    transactions[merchant_name](rowCount)
    .invoke('text').then((merchantName) => {
        Cypress.env('merchant_name', merchantName.trim());
    });

    transactions[customer_name](rowCount)
    .invoke('text').then((customerName) => {
        Cypress.env('customer_name', customerName.trim());
    });

    transactions[type](rowCount)
    .invoke('text').then((transactionType) => {
        Cypress.env('type', transactionType.trim());
    });

    transactions[method](rowCount)
    .invoke('text').then((method) => {
        Cypress.env('method', method.trim());
    });

    transactions[vendor](rowCount)
    .invoke('text').then((vendor) => {
        Cypress.env('vendor', vendor.trim());
    });

    transactions[solution](rowCount)
    .invoke('text').then((solution) => {
        Cypress.env('solution', solution.trim());
    });

    transactions[status](rowCount)
    .invoke('text').then((status) => {
        Cypress.env('status', status.trim());
    });

    transactions[amount](rowCount)
    .invoke('text').then((amount) => {
        Cypress.env('amount', amount.trim());
    });

    transactions[net_amount](rowCount)
    .invoke('text').then((net_amount) => {
        Cypress.env('net_amount', net_amount.trim());
    });

    // cy.wait(3000) //temp load
    // cy.log("Fetch")
};

module.exports = fetchTransactionData;