import { transactionpage_locators } from "../../fixtures/prd/locators";

export const filterTransactions = (merchantName,transactionType, vendorType, solution) => {
    cy.get(transactionpage_locators.search_bar).type(merchantName+'{enter}');
    cy.wait(7300);
    
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
};