import TransactionPageTest from '../../pages/transactionPage';

const transactions = new TransactionPageTest();
export const filterTransactions = (transactionType, vendorType, solution, dateFilter, pagenav) => {
    transactions.getTransactionDropdownType()
    .should('be.visible', {timeout: 3500, interval: 1200}).click();
    transactions[transactionType]().click();

    transactions.getTransactionDropdownVendor().should('be.visible', {timeout: 3500, interval: 1200}).click();
    transactions[vendorType]().click();

    transactions.getTransactionDropdownSolution()
    .should('be.visible', {timeout: 3500, interval: 1200}).click();
    transactions[solution]().click();
    cy.wait(3000)

    // Filter by date
    transactions.getTransactionDropdownDate()
    .click({timeout: 3500, interval: 1200});

    transactions.getTransactionDateFilter1(dateFilter)
    .click({ timeout: 5500, interval: 1200})

    // search pagenum in GoTo search bar
    transactions.getTransactionGoToSearch().type(pagenav+'{enter}');
    cy.wait(5000);
};

module.exports = filterTransactions;