import TransactionPageTest from '../../pages/transactionPage';

const transactions = new TransactionPageTest();
export const filterTransactions = (dateFilter, pagenav) => {
    // Filter by date
    transactions.getTransactionDropdownDate()
    .click({timeout: 3500, interval: 1200});

    transactions.getTransactionDateFilter1(dateFilter)
    .click({ timeout: 5500, interval: 1200})
    cy.wait(2350);

    // search pagenum in GoTo search bar
    transactions.getTransactionGoToSearch().type(pagenav+'{enter}');
    cy.wait(5000);
};

module.exports = filterTransactions;