class TransactionDetailsPageTest {
    getTransactionDetailsBody() {
        return cy.get('body', {timeout:10000});
    }
    getTransactionDetailsNextBtn() {
        return cy.get('[aria-label="Next"]', {timeout:10000});
    }
    getTransactionDetailsPrevBtn() {
        return cy.get('[aria-label="Previous"]', {timeout:10000});
    }
    getMerchantNumber() {
        return cy.get('.gap-y-3 > :nth-child(1) > .list-value', {timeout:10000});
    }
    getStatus() {
        return cy.get('.gap-y-3 > :nth-child(2) > .list-value', {timeout:10000});
    }
    getType() {
        return cy.get('.gap-y-3 > :nth-child(4) > .list-value', {timeout:10000});
    }
    getMerchantName() {
        return cy.get(':nth-child(2) > .rs-panel-body > .flex > :nth-child(2) > .list-value', {timeout:10000});
    }
    getCustomerName() {
        return cy.get(':nth-child(3) > .rs-panel-body > .flex > :nth-child(1) > .list-value', {timeout:10000});
    }
    getSolutionRef() {
        return cy.get('.gap-y-3 > :nth-child(3) > .list-value', {timeout:10000});
    }
    invokeSolutionRef() {
        return cy.get('@solution_ref', {timeout:10000});
    }
    getMobile() {
        return cy.get('.flex > :nth-child(3) > .list-value', {timeout:10000});
    }
    invokeMobile() {
        return cy.get('@mobile', {timeout:10000});
    }
    getSettlementAmount() {
        return cy.get('.gap-y-3 > :nth-child(2) > .flex', {timeout:10000});
    }
    getSettlementFee() {
        return cy.get(':nth-child(4) > .flex', {timeout:10000});
    }
    getSettlementTotalAmount() {
        return cy.get(':nth-child(6) > .flex', {timeout:10000});
    }
    getViewPayload() {
        return cy.get('.rs-timeline-item-content > .capitalize > .rs-btn-group > .rs-btn', {timeout:10000});
    }
    findViewPayload(body) {
        return body.find('.rs-timeline-item-content > .capitalize > .rs-btn-group > .rs-btn', {timeout:10000});
    }
    getCloseModal() {
        return cy.get('[aria-label="close"]', {timeout:10000});
    }
    getModalContent() {
        return cy.get('pre', {timeout:10000});
    }
    getViewRequest() {
        return cy.get('.rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)', {timeout:10000});
    }
    getTypePF() {
        return cy.get('.gap-y-3 > :nth-child(3) > .list-value', {timeout:10000});
    }
    getViewPayloadPF() {
        return cy.get(':nth-child(3) > .rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)', {timeout:10000});
    }
    getViewRequestPF() {
        return cy.get(':nth-child(2) > .rs-timeline-item-content > .capitalize > .rs-btn-group > :nth-child(2)', {timeout:10000});
    }


    
}

module.exports = TransactionDetailsPageTest;