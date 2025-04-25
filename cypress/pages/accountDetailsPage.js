class AccountDetailsPageTest {
    getAccountDetailsGeneralTab() {
        return cy.get(".my-3 > :nth-child(1)", {timeout: 10000});
    }
    getAccountDetailsBalancesTab() {
        return cy.get(".my-3 > :nth-child(2)", {timeout: 10000});
    }
    getAccountDetailsSettlementTab() {
        return cy.get(".my-3 > :nth-child(3)", {timeout: 10000});
    }
    getAccountDetailsTransactionsTab() {
        return cy.get(".my-3 > :nth-child(4)", {timeout: 10000});
    }
    getAccountDetailsCustomersTab() {
        return cy.get(".my-3 > :nth-child(5)", {timeout: 10000});
    }
    getAccountDetailsSettingsTab() {
        return cy.get(".my-3 > :nth-child(6)", {timeout: 10000});
    }
    getAccountDetailsFeesTab() {
        return cy.get(".my-3 > :nth-child(7)", {timeout: 10000});
    }

    getAccountDetailsCustomerRow() {
        return cy.get(".rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountDetailsLocatorBase1() {
        return cy.get('[aria-rowindex="');
    }
    getAccountDetailsLocatorBase2() {
        return cy.get('"] > .rs-table-cell-group > ');
    }
    getAccountDetailsExist() {
        return cy.get('[aria-colindex="2"] > .rs-table-cell-content > a', {timeout: 10000});
    }

    getAccountDetailsAccountNumber() {
        return cy.get('.rs-table-cell-first > .rs-table-cell-content > a', {timeout: 10000});
    }
    getAccountDetailsCustomerNumber() {
        return cy.get('[aria-colindex="2"] > .rs-table-cell-content > a', {timeout: 10000})
    }
    getAccountDetailsCustomerName() {
        return cy.get('[aria-colindex="3"] > .rs-table-cell-content > a', {timeout: 10000})
    }
    getAccountDetailsEmailAddress() {
        return cy.get('[aria-colindex="4"] > .rs-table-cell-content > a', {timeout: 10000})
    }
    getAccountDetailsMobile(){
        return cy.get('[aria-colindex="5"] > .rs-table-cell-content > a', {timeout: 10000})
    }
    getAccountDetailsCity(){
        return cy.get('[aria-colindex="6"] > .rs-table-cell-content', {timeout: 10000})
    }
    getAccountDetailsCountry(){
        return cy.get('[aria-colindex="7"] > .rs-table-cell-content', {timeout: 10000})
    }

    getAccountDetailsCustomerGotoSearch(){
        return cy.get('.rs-pagination-group-skip > :nth-child(2) > .rs-input', {timeout: 10000})
    }
}


module.exports = AccountDetailsPageTest;