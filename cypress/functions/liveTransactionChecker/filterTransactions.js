import { transactionpage_locators } from "../../fixtures/prd/locators";

export const filterTransactions = (transactionType, vendorType, solution, dateFilter, pagenav) => {
    cy.get(transactionpage_locators.type_dropdown)
    .should('be.visible', {timeout: 3500, interval: 1200}).click();
    cy.get(transactionpage_locators[transactionType]).click();
    cy.get(transactionpage_locators.vendor_dropdown)
    .should('be.visible', {timeout: 3500, interval: 1200}).click();
    cy.get(transactionpage_locators[vendorType]).click();
    cy.get(transactionpage_locators.solution_dropdown)
    .should('be.visible', {timeout: 3500, interval: 1200}).click();
    cy.get(transactionpage_locators[solution]).click();
    cy.wait(3000)

    // Filter by date
    cy.get(transactionpage_locators.date_dropdown)
    .click({timeout: 3500, interval: 1200});
    // select date
    // cy.get(transactionpage_locators.filterDateTemp1 + dateFilter + transactionpage_locators.filterDateTemp2)
    // .click({ timeout: 5500, interval: 1200})
    // cy.get(".rs-calendar-table-cell-selected > .rs-calendar-table-cell-content > .rs-calendar-table-cell-day")
    // .click({ timeout: 5500, interval: 1200})

    cy.get(transactionpage_locators.date_filter1 + dateFilter + transactionpage_locators.date_filter2)
    .click({ timeout: 5500, interval: 1200})

    // cy.get(transactionpage_locators.filterOkButton)
    // .click({timeout: 4500, interval: 1200});
    // cy.wait(3000)

    // search pagenum in GoTo search bar
    cy.get(transactionpage_locators.transaction_gotosearch).type(pagenav+'{enter}');
    cy.wait(5000);
};