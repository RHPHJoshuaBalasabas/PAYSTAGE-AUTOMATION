class SettlementPage {
    getSettlementSolutionMenu() {
        return cy.get('.p-4');
    }
    getSettlementLocatorBase1() {
        return cy.get(`[aria-rowindex=""] > .rs-table-cell-group > `);
    }
    getSettlementLocatorBase2() {
        return cy.get('');
    }

    getSettlementTransactionNumber(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > .lowercase > .rs-table-cell-content > a`);
    }

    getSettlementCheckbox(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > .flex > .rs-checkbox > .rs-checkbox-checker > label > .rs-checkbox-wrapper`)
    }
    getSettlementRecordTime(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > [aria-colindex="2"] > .rs-table-cell-content > .flex > span`)
    }
    getSettlementCutoff(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content`)
    }
    getSettlementAccountNumber(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content`)
    }
    getSettlementAccountName(){
        return cy.get('[aria-colindex="6"] > .rs-table-cell-content')
    }
    getSettlementTransactionNumber(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > [aria-colindex="7"] > .rs-table-cell-content`)
    }
    getSettlementStatus(x){
        return cy.get(`[aria-rowindex="${x}"] > .rs-table-cell-group > [aria-colindex="17"] > .rs-table-cell-content`)
    }
}

module.exports = SettlementPage;