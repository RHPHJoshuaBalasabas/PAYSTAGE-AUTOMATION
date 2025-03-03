class TopupBalancePageTest {
    getTopupBalanceInstapay() {
        return cy.get('.flex-row-reverse > :nth-child(6)', { timeout: 10000 });
    }
    getTopupBalancePesonet() {
        return cy.get('.flex-row-reverse > :nth-child(7)', { timeout: 10000 });
    }
    getTopupBalanceSearch() {
        return cy.get('.rs-form-control > .rs-input');
    }
    getTopupBalanceTotalTopupAmount2ndRow() {
        return cy.get('[aria-rowindex="3"] > .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content', { timeout: 10000, delay:5200 });
    }
    getTopupBalanceTotalWithdrawalAmount2ndRow() {
        return cy.get('[aria-rowindex="3"] > .rs-table-cell-group > [aria-colindex="6"] > .rs-table-cell-content', { timeout: 10000, delay:5200 });
    }
    getTopupBalanceAvailableBalance2ndRow() {
        return cy.get('[aria-rowindex="3"] > .rs-table-cell-group > .rs-table-cell-last > .rs-table-cell-content', { timeout: 10000, delay:5200 });
    }
}

module.exports = TopupBalancePageTest;