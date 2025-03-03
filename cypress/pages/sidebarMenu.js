class SidebarMenuTest {
    getTransactionModule() {
        return cy.get(":nth-child(5) > .rs-dropdown-toggle", {timeout: 10000});
    }
    getTransactionSubModule() {
        return cy.get(".rs-dropdown-expand > .rs-dropdown-menu > :nth-child(1) > .rs-dropdown-item", {timeout: 10000});
    }
    getAccountsModule() {
        return cy.get("[href='https://portal.paystage.net/accounts']", {timeout: 10000});
    }
    getCustomersModule() {
        return cy.get("[href='https://portal.paystage.net/customers']");
    }
    getTopupBalanceModule() {
        return cy.get('[href="https://portal.paystage.net/top-ups"]');
    }
}

module.exports = SidebarMenuTest;