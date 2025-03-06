import TransactionPageTest from '../../pages/transactionPage';

const transactions = new TransactionPageTest();
const filterTransactions=(merchantName,transactionType, vendorType, solution) => {
    if (typeof transactions[transactionType] === "function") { 
        transactions.getTransactionSearchBar().type(merchantName+'{enter}');
        cy.wait(7300);
        transactions.getTransactionDropdownType()
        .should('be.visible', {timeout: 3500, interval: 1200}).click();
        transactions[transactionType]().click();

        transactions.getTransactionDropdownVendor().should('be.visible', {timeout: 3500, interval: 1200}).click();
        transactions[vendorType]().click();
        cy.wait(3000)

        transactions.getTransactionDropdownSolution()
        .should('be.visible', {timeout: 3500, interval: 1200}).click();
        transactions[solution]().click();
        cy.wait(3000)
    }
};

module.exports = filterTransactions;