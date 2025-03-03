class ReadFilePayload {
    getAmount() {
        return cy.get('@payload_amount', {timeout:10000});
    }
    getTransactionNum() {
        return cy.get('@payload_transaction_number', {timeout:10000});
    }
    getStatus() {
        return cy.get('@payload_status', {timeout:10000});
    }
    getSolutionRef() {
        return cy.get('@payload_solrefno', {timeout:10000});
    }
    getMerchantRef() {
        return cy.get('@payload_merrefno', {timeout:10000});
    }
    getCurrency() {
        return cy.get('@payload_currency', {timeout:10000});
    }
    getFee() {
        return cy.get('@payload_fee', {timeout:10000});
    }
    getUID() {
        return cy.get('@payload_uid', {timeout:10000});
    }
    getMerchantTransactionNum() {
        return cy.get('@payload_merchant_transaction_number', {timeout:10000});
    }
}

class ReadFileCallback {
    getTransactionNum() {
        return cy.get('@callback_transaction_number', {timeout:10000});
    }
    getMerchantRef() {
        return cy.get('@callback_merrefno', {timeout:10000});
    }
    getStatus() {
        return cy.get('@callback_status', {timeout:10000});
    }
    getCustomerMobile() {
        return cy.get('@callback_customer_mobile', {timeout:10000});
    }
    getCreditAmount() {
        return cy.get('@callback_credit_amount', {timeout:10000});
    }
    getCreditCurrency() {
        return cy.get('@callback_credit_currency', {timeout:10000});
    }
    getFee() {
        return cy.get('@callback_fee', {timeout:10000});
    }
    getTotalAmount() {
        return cy.get('@callback_total_amount', {timeout:10000});
    }
}

module.exports = { ReadFilePayload, ReadFileCallback };