class TransactionPageTest {
    getTransactionTableRow() {
        return cy.get('[class="rs-table-row"]');
    }
    getTransactionLocatorBase1() {
        return cy.get('[aria-rowindex="');
    }
    getTransactionLocatorBase2() {
        return cy.get('"] > .rs-table-cell-group > ');
    }
    getTransactionExist() {
        return cy.get("[aria-colindex='3'] > .rs-table-cell-content > a");
    }

    getTransactionTransactionNumber() {
        return cy.get('[aria-colindex="3"] > .rs-table-cell-content > a');
    }
    getTransactionMerchantNumber() {
        return cy.get('[aria-colindex="4"] > .rs-table-cell-content');
    }
    getTransactionMerchantName() {
        return cy.get('[aria-colindex="6"] > .rs-table-cell-content');
    }
    getTransactionCustomerName() {
        return cy.get('.lowercase > .rs-table-cell-content > span');
    }

    getTransactionType() {
        return cy.get('[aria-colindex="8"] > .rs-table-cell-content');
    }
    getTransactionMethod() {
        return cy.get('[aria-colindex="9"] > .rs-table-cell-content > span');
    }
    getTransactionVendor() {
        return cy.get('[aria-colindex="10"] > .rs-table-cell-content');
    }
    getTransactionSolution() {
        return cy.get('[aria-colindex="11"] > .rs-table-cell-content');
    }
    getTransactionStatus() {
        return cy.get('[aria-colindex="12"] > .rs-table-cell-content > span');
    }
    getTransactionAmount() {
        return cy.get('[aria-colindex="13"] > .rs-table-cell-content');
    }
    getTransactionNetAmount() {
        return cy.get('[aria-colindex="16"] > .rs-table-cell-content');
    }

    getTransactionSearchBar() {
        return cy.get('.rs-input-group > .rs-input');
    }
    
    getTransactionDropdownDate() {
        return cy.get(':nth-child(8) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"] > .rs-picker-toggle-textbox');
    }
    getTransactionDateFilter1(x) {
        return cy.get(`.rs-picker-toolbar-ranges > :nth-child(${x}) > .rs-btn`);
    }
    // getTransactionDateFilter2() {
    //     return cy.get(") > .rs-btn");
    // }

    getTransactionDropdownType() {
        return cy.get(":nth-child(2) > .w-full > .rs-picker-toggle");
    }
    getTransactionTypeWithdrawal() {
        return cy.get('[data-key="withdrawal"] > .rs-picker-select-menu-item');
    }
    getTransactionTypeDeposit() {
        return cy.get('[data-key="deposit"] > .rs-picker-select-menu-item');
    }
    
    getTransactionDropdownVendor() {
        return cy.get(":nth-child(4) > .w-full > .rs-picker-toggle");
    }
    getTransactionJpayVendor() {
        return cy.get('[data-key="jpay"] > .rs-picker-select-menu-item');
    }
    getTransactionAllBankVendor() {
        return cy.get('[data-key="all_bank"] > .rs-picker-select-menu-item');
    }
    getTransactionTopPayVendor() {
        return cy.get('[data-key="top_pay"] > .rs-picker-select-menu-item');
    }

    getTransactionDropdownSolution() {
        return cy.get(":nth-child(5) > .w-full > .rs-picker-toggle");
    }
    getTransactionLbtJapanSolution() {
        return cy.get('[data-key="local_bank_japan"] > .rs-picker-select-menu-item');
    }
    getTransactionQRPHSolution() {
        return cy.get('[data-key="qrph"] > .rs-picker-select-menu-item');
    }
    getTransactionInstapaySolution() {
        return cy.get('[data-key="instapay"] > .rs-picker-select-menu-item');
    }
    getTransactionLbtIndoSolution() {
        return cy.get('[data-key="local_bank_indonesia"] > .rs-picker-select-menu-item');
    }
    getTransactionLbtThaiSolution() {
        return cy.get('[data-key="local_bank_thailand"] > .rs-picker-select-menu-item');
    }

    getTransactionDropdownStatus() {
        return cy.get(':nth-child(6) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"]');
    }
    getTransactionStatusPending() {
        return cy.get('[data-key="pending"] > .rs-picker-select-menu-item');
    }
    getTransactionStatusCompleted() {
        return cy.get('[data-key="completed"] > .rs-picker-select-menu-item');
    }
    getTransactionStatusFailed() {
        return cy.get('[data-key="failed"] > .rs-picker-select-menu-item');
    }

    getTransactionPageNavigationHolder1() {
        return cy.get('[aria-label=');
    }
    getTransactionPageNavigationHolder2() {
        return cy.get(']');
    }

    getTransactionGoToSearch() {
        return cy.get('.rs-pagination-group-skip > :nth-child(2) > .rs-input');
    }

    getTransactionFilterDateTemp1() {
        return cy.get('[aria-label="');
    }
    getTransactionFilterDateTemp2() {
        return cy.get(' Sep 2024"] > .rs-calendar-table-cell-content > .rs-calendar-table-cell-day');
    }
    getTransactionFilterOkButton() {
        return cy.get('.rs-picker-toolbar-right > .rs-btn');
    }
}

module.exports = TransactionPageTest;