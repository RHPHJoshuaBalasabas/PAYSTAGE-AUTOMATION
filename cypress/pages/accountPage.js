class AccountsPageTest {
    getAccountHeaderText() {
        return cy.get(".flex-1", {timeout: 10000});
    }
    getAccountExportButton() {
        return cy.get(".rs-flex-box-grid > :nth-child(2) > .rs-btn > div", {timeout: 10000, delay: 1000});
    }
    getAccountCreateButton() {
        return cy.get(".mb-4 > :nth-child(2) > .rs-btn", {timeout: 10000});
    }
    getAccountSearchFilter() {
        return cy.get("#search", {timeout: 10000});
    }
    getAccountTypeFilter() {
        return cy.get(".rs-form > :nth-child(2)", {timeout: 10000});
    }
    getAccountKycFilter() {
        return cy.get(".rs-form > :nth-child(3)", {timeout: 10000});
    }
    getAccountIntegrationFilter() {
        return cy.get(".rs-form > :nth-child(4)", {timeout: 10000});
    }
    getAccountAccountNumberTH() {
        return cy.get(".rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountMerchantNameTH() {
        return cy.get(":nth-child(2) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountTypeTH() {
        return cy.get(":nth-child(3) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountKycTH() {
        return cy.get(":nth-child(4) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountIntegrationTH() {
        return cy.get(":nth-child(5) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountRegisteredDateTH() {
        return cy.get(":nth-child(6) > .rs-table-cell > .rs-table-cell-content", {timeout: 10000});
    }
    getAccountAccountNumberData() {
        return cy.get(".rs-table-cell-content > a", {timeout: 10000});
    }
    getAccountAccountNumberData2ndRow() {
        return cy.get("[aria-rowindex='3'] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > a", {timeout: 10000});
    }
    getAccountPagination() {
        return cy.get(".rs-pagination", {timeout: 10000});
    }
    getAccountNextButton() {
        return cy.get('[aria-label="Next"]', {timeout: 10000});
    }
    getAccountPrevButton() {
        return cy.get('[aria-label="Previous"]', {timeout: 10000});
    }
    getAccountPagePicker() {
        return cy.get(".rs-picker-toggle", {timeout: 10000});
    }
    getAccountGoToSearch() {
        return cy.get(".rs-pagination-group-skip", {timeout: 10000});
    }
}

module.exports = AccountsPageTest;
