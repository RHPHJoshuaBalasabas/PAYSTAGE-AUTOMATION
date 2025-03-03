class AccountDetailsPageTest {
    getAccountDetailsGeneralTab() {
        return cy.get(".my-3 > :nth-child(1)");
    }
    getAccountDetailsBalancesTab() {
        return cy.get(".my-3 > :nth-child(2)");
    }
    getAccountDetailsSettlementTab() {
        return cy.get(".my-3 > :nth-child(3)", {timeout: 10000});
    }
    getAccountDetailsTransactionsTab() {
        return cy.get(".my-3 > :nth-child(4)");
    }
    getAccountDetailsCustomersTab() {
        return cy.get(".my-3 > :nth-child(5)");
    }
    getAccountDetailsSettingsTab() {
        return cy.get(".my-3 > :nth-child(6)");
    }
    getAccountDetailsFeesTab() {
        return cy.get(".my-3 > :nth-child(7)");
    }

    getAccountDetailsCustomerRow() {
        return cy.get(".rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content");
    }
    getAccountDetailsLocatorBase1() {
        return cy.get('[aria-rowindex="');
    }
    getAccountDetailsLocatorBase2() {
        return cy.get('"] > .rs-table-cell-group > ');
    }
    getAccountDetailsExist() {
        return cy.get('[aria-colindex="2"] > .rs-table-cell-content > a');
    }

    getAccountDetailsAccountNumber() {
        return cy.get('.rs-table-cell-first > .rs-table-cell-content > a');
    }
    getAccountDetailsCustomerNumber() {
        return cy.get('[aria-colindex="2"] > .rs-table-cell-content > a')
    }
    getAccountDetailsCustomerName() {
        return cy.get('[aria-colindex="3"] > .rs-table-cell-content > a')
    }
    getAccountDetailsEmailAddress() {
        return cy.get('[aria-colindex="4"] > .rs-table-cell-content > a')
    }
    getAccountDetailsMobile(){
        return cy.get('[aria-colindex="5"] > .rs-table-cell-content > a')
    }
    getAccountDetailsCity(){
        return cy.get('[aria-colindex="6"] > .rs-table-cell-content')
    }
    getAccountDetailsCountry(){
        return cy.get('[aria-colindex="7"] > .rs-table-cell-content')
    }

    getAccountDetailsCustomerGotoSearch(){
        return cy.get('.rs-pagination-group-skip > :nth-child(2) > .rs-input')
    }
}


module.exports = AccountDetailsPageTest;