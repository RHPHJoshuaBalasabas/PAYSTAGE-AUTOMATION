class TopupHistoryPageTest {
    getTopupHistory() {
        return cy.get('.mb-3 > :nth-child(2)', { timeout: 10000 });
    }
    getTopupHistoryRow(){
        return cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content', { timeout: 10000 })
    }
    getTopupHistorySearch() {
        return cy.get('.rs-input-group > .rs-input', { timeout: 10000 });
    }
    getSolutionDropdown() {
        return cy.get('.space-y-1 > .w-full > .rs-picker-toggle', { timeout: 10000 });
    }
    getSolutionInstapay() {
        return cy.get('[data-key="instapay"] > .rs-picker-select-menu-item', { timeout: 10000 });
    }
    getTopupHistoryExportBtn() {
        return cy.get('.flex > :nth-child(2) > div', { timeout: 3500, interval: 1200 });
    }
    getTopupHistoryDownloadBtn() {
        return cy.get('a.rs-btn > div', { timeout: 50000 });
    }
}

module.exports = TopupHistoryPageTest;