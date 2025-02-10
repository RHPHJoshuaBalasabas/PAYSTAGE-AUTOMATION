class SidebarMenuTest {
    getTransactionModule() {
        return cy.get(":nth-child(5) > .rs-dropdown-toggle");
    }
    getTransactionSubModule() {
        return cy.get(".rs-dropdown-expand > .rs-dropdown-menu > :nth-child(1) > .rs-dropdown-item");
    }
    getAccountsModule() {
        return cy.get("[href='https://portal.paystage.net/accounts']");
    }
    getCustomersModule() {
        return cy.get("[href='https://portal.paystage.net/customers']");
    }
}

module.exports = SidebarMenuTest;