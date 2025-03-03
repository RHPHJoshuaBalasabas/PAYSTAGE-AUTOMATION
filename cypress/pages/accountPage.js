class AccountsPageTest {
    getAccountHeaderText() {
        return cy.get(".flex-1");
    }
    getAccountExportButton() {
        return cy.get(".rs-flex-box-grid > :nth-child(2) > .rs-btn > div", {timeout: 10000, delay: 1000});
    }
    getAccountCreateButton() {
        return cy.get(".mb-4 > :nth-child(2) > .rs-btn");
    }
    getAccountSearchFilter() {
        return cy.get("#search", {timeout: 10000});
    }
    getAccountTypeFilter() {
        return cy.get(".rs-form > :nth-child(2)");
    }
    getAccountKycFilter() {
        return cy.get(".rs-form > :nth-child(3)");
    }
    getAccountIntegrationFilter() {
        return cy.get(".rs-form > :nth-child(4)");
    }
    getAccountAccountNumberTH() {
        return cy.get(".rs-table-cell-group > :nth-child(1) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountMerchantNameTH() {
        return cy.get(":nth-child(2) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountTypeTH() {
        return cy.get(":nth-child(3) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountKycTH() {
        return cy.get(":nth-child(4) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountIntegrationTH() {
        return cy.get(":nth-child(5) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountRegisteredDateTH() {
        return cy.get(":nth-child(6) > .rs-table-cell > .rs-table-cell-content");
    }
    getAccountAccountNumberData() {
        return cy.get(".rs-table-cell-content > a", {timeout: 10000});
    }
    getAccountAccountNumberData2ndRow() {
        return cy.get("[aria-rowindex='3'] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > a", {timeout: 10000});
    }
    getAccountPagination() {
        return cy.get(".rs-pagination");
    }
    getAccountNextButton() {
        return cy.get('[aria-label="Next"]');
    }
    getAccountPrevButton() {
        return cy.get('[aria-label="Previous"]');
    }
    getAccountPagePicker() {
        return cy.get(".rs-picker-toggle");
    }
    getAccountGoToSearch() {
        return cy.get(".rs-pagination-group-skip");
    }
}

module.exports = AccountsPageTest;
