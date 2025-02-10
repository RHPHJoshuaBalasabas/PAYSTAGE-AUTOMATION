import { transactionpage_locators } from "../../fixtures/prd/locators";

export const fetchTransactionData =
(rowCount,transaction_number, merchant_number, merchant_name, customer_name, type, method, vendor, solution, status, amount, net_amount) => {
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[transaction_number])
        .invoke('text').as('transaction_number');
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[merchant_number])
        .invoke('text').then((merchantNumber) => {
        Cypress.env('merchant_number', merchantNumber.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[merchant_name])
        .invoke('text').then((merchantName) => {
        Cypress.env('merchant_name', merchantName.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[customer_name])
        .invoke('text').then((customerName) => {
        Cypress.env('customer_name', customerName.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[type])
        .invoke('text').then((transactionType) => {
        Cypress.env('transaction_type', transactionType.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[method])
        .invoke('text').then((method) => {
        Cypress.env('method', method.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[vendor])
        .invoke('text').then((vendor) => {
        Cypress.env('vendor', vendor.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[solution])
        .invoke('text').then((solution) => {
        Cypress.env('solution', solution.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[status])
        .invoke('text').then((status) => {
        Cypress.env('status', status.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[amount])
        .invoke('text').then((amount) => {
        Cypress.env('amount', amount.trim());
    });
    cy.get(transactionpage_locators.locator_base1+[rowCount]+
        transactionpage_locators.locator_base2+
        transactionpage_locators[net_amount])
        .invoke('text').then((net_amount) => {
        Cypress.env('net_amount', net_amount.trim());
    });

    cy.wait(3000) //temp load
    cy.log("Fetch")
};