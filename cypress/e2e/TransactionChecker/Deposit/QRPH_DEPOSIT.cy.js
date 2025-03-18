import { common } from "../../../fixtures/prd/common";
import filterTransactions from '../../../functions/liveTransactionChecker/filterTransactions';
import fetchTransactionData from '../../../functions/liveTransactionChecker/base_date_storage';
import LoginPageTest from '../../../pages/loginPage';
import SidebarMenuTest from '../../../pages/sidebarMenu';
import TransactionPageTest from '../../../pages/transactionPage';
import TransactionDetailsPageTest from '../../../pages/transactionDetailsPage';
import { ReadFilePayload, ReadFileCallback } from '../../../apiResponse/readFileResponse';

// npx cypress run --spec "cypress/e2e/TransactionChecker/Deposit/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/Deposit/QRPH_DEPOSIT.cy.js"
// npx cypress open
// ./config.cmd --url https://github.com/Chzubaga/paystage_cy --token A7RQNS5BNE5GXNPQXMZFN43GRNPWC

const data_response_holder ={
    rwPayload: 'cypress/apiResponse/stored_data_payload.json',
    rwCompleted: 'cypress/apiResponse/stored_data_completed.json',
}

Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err) => {
    // Handle specific errors gracefully
    if (err.message.includes('canceled') || err.message.includes('specific error message to ignore')) {
        return false;
    }
    return true;
});

function roundToTwo(num) {
    return Math.ceil(num * 100) / 100;
}

const filpath = 'cypress/e2e/Reports/LiveTransactionChecker/LiveTransactionChecker.xlsx'; //changed to excel path file
const sheetName = "QPRH DEPOSIT";
const pageLength = 5;

const PageNav = Array.from({ length: pageLength }, (_, i) => i + 1);

const login = new LoginPageTest();
const sideMenu = new SidebarMenuTest();
const transactions = new TransactionPageTest();
const transactiondetails = new TransactionDetailsPageTest();
const readFilePayload = new ReadFilePayload();
const readFileCallback = new ReadFileCallback();

describe('Looping within an it block', () => {
    PageNav.forEach((pageNav) => {
        it(`Should test transactions for Page: ${pageNav}`, () => {
            // Login
            cy.visit(common.login_url);
            login.getEmailField().type(common.adminEmail);
            login.getPasswordField().type(common.adminPass);
            login.getSubmitButton().click();

            // Navigate to transaction page
            sideMenu.getTransactionModule().click();
            sideMenu.getTransactionSubModule().click();

            // Filter transactions
            filterTransactions('getTransactionTypeDeposit', 'getTransactionAllBankVendor', 'getTransactionQRPHSolution', 1, pageNav, { timeout: 5500 });
            try {
                transactions.getTransactionBody().then(($body) => {
                    if ($body.find('.rs-pagination-btn-active').length) {
                        transactions.getTransactionPageNavigationLandingPage().invoke('text').then((active_page_num)=>{
                            if(pageNav == active_page_num){
                                transactions.getTransactionTableRow().its('length').then((rowCount) => {
                                    let startRow = (pageNav - 1) * 20 + 1;
                                    for (let x = 2; x <= rowCount+1; x++) {
                                    //for (let x = 2; x <= 11; x++) {
                                        transactions.getTransactionTransactionNumber(x).then((isTransactionExist) => {
                                            console.log("isTransactionExist is existing: "+isTransactionExist);
                                            if (isTransactionExist) {
                                                fetchTransactionData(x, 'getTransactionTransactionNumber', 'getTransactionMerchantNumber', 'getTransactionMerchantName',
                                                    'getTransactionCustomerName', 'getTransactionType', 'getTransactionMethod', 'getTransactionVendor', 'getTransactionSolution',
                                                    'getTransactionStatus', 'getTransactionAmount', 'getTransactionNetAmount');

                                                cy.get('@transaction_number').then((transactionNumber) => {
                                                    validateTransactionDetails(transactionNumber, pageNav, x, startRow, filpath, sheetName);
                                                    validateWebhookResponses(transactionNumber, filpath, sheetName, startRow + x - 1);
                                                    writeInGoogleSheet(filpath, startRow + x - 1, sheetName);
                                                    cy.task('log', transactionNumber);
                                                });
                                            } else {
                                                cy.log("No transaction found at row " + x);
                                            }
                                            cy.go('back', { timeout: 5000 });
                                            cy.wait(3250);
                                            filterTransactions('getTransactionTypeDeposit', 'getTransactionAllBankVendor', 'getTransactionQRPHSolution', 1, pageNav, { timeout: 5500 });
                                        });
                                    }
                                });
                            }else{
                                cy.log("No page found ");
                            }
                        })
                    } else {
                        cy.log('No transaction found, skipping the test...');
                    }
                });
            } catch (error) {
                cy.log("Error in filtering transactions");
            }
        });
    });
});

const validateTransactionDetails = (transactionNumber, pageNav, row, startRow, filpath, sheetName) => {
    try {
        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`).wait(5000);
        const storedStatus = Cypress.env('status');
        if (storedStatus !== 'completed') {
            cy.log(`Skip test as Instapay status is ${storedStatus}.`);
            transactiondetails.getMerchantNumber().should('be.visible')
            .and('have.text', Cypress.env('merchant_number'));
            transactiondetails.getStatus().should('be.visible')
            .and('have.text', Cypress.env('status'));
            transactiondetails.getMerchantName().should('be.visible')
            .and('have.text', Cypress.env('merchant_name'));
            transactiondetails.getCustomerName().should('be.visible')
            .and('have.text', Cypress.env('customer_name'));
            transactiondetails.getMobile().invoke('text').as('mobile');
            transactiondetails.getViewRequest().first().contains('View request').click({ waitForAnimations: false });
            transactiondetails.getModalContent().invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
            return;
        }

        transactiondetails.getMerchantNumber().should('be.visible')
        .and('have.text', Cypress.env('merchant_number'));
        transactiondetails.getStatus().should('be.visible')
        .and('have.text', Cypress.env('status'));
        transactiondetails.getType().should('be.visible')
        .and('have.text', Cypress.env('type'));
        transactiondetails.getMerchantName().should('be.visible')
        .and('have.text', Cypress.env('merchant_name'));
        transactiondetails.getCustomerName().should('be.visible')
        .and('have.text', Cypress.env('customer_name'));
        transactiondetails.getSolutionRef().invoke('text').as('solution_ref');
        transactiondetails.getMobile().invoke('text').as('mobile');

        transactiondetails.getTransactionDetailsBody().then(($body) => {
            const viewPayload = transactiondetails.findViewPayload($body);
            if (viewPayload.length && viewPayload.text().includes('View Payload')) {
                cy.log("with view payload");
                transactiondetails.getViewPayload().contains('View Payload')
                .should('be.visible').click({ waitForAnimations: false });
                transactiondetails.getModalContent().invoke('text').then((receivedPayload) => {                
                    cy.writeFile(data_response_holder.rwPayload, receivedPayload);
                });
                transactiondetails.getCloseModal().click({ waitForAnimations: false });
            } else {
                cy.log("no view payload");
                transactiondetails.getTransactionDetailsNextBtn().click();
                transactiondetails.getViewPayload().contains('View Payload').should('be.visible').click({ waitForAnimations: false });
                transactiondetails.getModalContent().invoke('text').then((receivedPayload) => {
                    cy.writeFile(data_response_holder.rwPayload, receivedPayload);
                });
                transactiondetails.getCloseModal().click({ waitForAnimations: false });
                transactiondetails.getTransactionDetailsPrevBtn().click();
            }
        });
        transactiondetails.getViewRequest().first().contains('View request').click({ waitForAnimations: false });
        transactiondetails.getModalContent().invoke('text').then((sent_payload_completed) => {
            cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
        });
        validateWebhookResponses(filpath, sheetName, startRow + row - 1);
    } catch (error) {
        cy.log("Error in validating transaction details");
    }
};

const validateWebhookResponses = (transactionNumber, filpath, sheetName, sheetRow) => {
    const resultCell = `I${sheetRow}`;
    const remarksCell = `J${sheetRow}`;
    const storedStatus = Cypress.env('status');
    if (storedStatus !== 'completed') {
        cy.log(`Skip test as Instapay status is ${storedStatus}.`);
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        readFileCallback.getTransactionNum().then((callback_transaction_number) => {
            expect(callback_transaction_number).to.eq(transactionNumber);
        });
        readFileCallback.getMerchantRef().then((callbackMerRefNo) => {
            transactiondetails.getMerchantNumber().should('be.visible').and('have.text', callbackMerRefNo);
        });
        readFileCallback.getStatus().then((status) => {
            transactiondetails.getStatus().should('be.visible').and('have.text', status);
        });
        readFileCallback.getCustomerMobile().then((mobile) => {
            transactiondetails.getMobile().should('be.visible').and('have.text', mobile);
        });

        if (storedStatus == 'pending'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PENDING'});
            return;
        } else if(storedStatus == 'failed'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'FAILED'});
            return;
        } else if(storedStatus == 'expired'){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'EXPIRED'});
            return;
        }
    }
    try {
        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
            cy.wrap(payloadResponse.amount).as('payload_amount');
            cy.wrap(payloadResponse.txnid).as('payload_transaction_number');
            cy.wrap(payloadResponse.status).as('payload_status');
            cy.wrap(payloadResponse.refno).as('payload_solrefno');
            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merrefno');
            cy.wrap(payloadResponse.transaction.currency).as('payload_currency');
        });
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.credit_currency).as('callback_credit_currency');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        
        readFilePayload.getAmount().then((payload_amount) => {
            const amount = parseInt(payload_amount);
            const merchant_name = Cypress.env('merchant_name');

                switch (merchant_name) {
                    case 'TECHOPTIONS (CY) GROUP LIMITED':
                    case 'TECHSOLUTIONS (CY) GROUP LIMITED':
                        const fee = Math.max(25, roundToTwo(amount * 0.04));
                        readFileCallback.getFee().should('eq', fee);
                        readFileCallback.getTotalAmount().should('eq', amount - fee);
                        break;
                    case 'RIVALRY LIMITED':
                        const rivalryFee = Math.max(13, roundToTwo(amount * 0.0275));
                        readFileCallback.getFee().should('eq', rivalryFee);
                        readFileCallback.getTotalAmount().should('eq', amount - rivalryFee);
                        break;
                    default:
                        const defaultFee = roundToTwo(amount * 0.02);
                        const adjustedFee = Cypress.env('merchant_name') === 'FooBar Prod' ? 1 : Math.max(10, defaultFee);
                    
                        readFileCallback.getFee().then((callback_fee)=>{
                            try{
                            expect(callback_fee).to.eq(adjustedFee);
                            }catch (error){
                                cy.log("The Fees are not equal to computed fees")
                                console.log("The Fees are not equal to computed fees")
                                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: remarksCell, value: `Computed Fees are not equal to actual fees.`});
                            }
                            readFileCallback.getTotalAmount().then((callback_total_amount)=>{
                                expect(callback_total_amount).to.eq(amount - callback_fee);
                            });
                        });
                    
                }
            readFileCallback.getCreditAmount().should('eq', payload_amount);
        });

        readFilePayload.getTransactionNum().then((payload_transaction_number) => {
            readFileCallback.getTransactionNum().should('eq', payload_transaction_number);
        });

        const expectedStatus = Cypress.env('status') === 'completed' ? 'S' : 'F';
        readFilePayload.getStatus().should('eq', expectedStatus);

        transactiondetails.invokeSolutionRef().then((solutionRef) => {
            readFilePayload.getSolutionRef().should('eq', solutionRef);
        });
        
        transactiondetails.invokeMobile().then((mobile) => {
            readFileCallback.getCustomerMobile().should('eq', mobile);
        });

        readFileCallback.getMerchantRef().then((callbackMerRefNo) => {
            readFilePayload.getMerchantRef().should('eq', callbackMerRefNo);
        });

        readFileCallback.getCreditCurrency().then((callbackCurrency) => {
            readFilePayload.getCurrency().should('eq', callbackCurrency);
        });

        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PASSED'});
    } catch (error) {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'FAILED'});
    }
};

const writeInGoogleSheet = (filpath, sheetRow, sheetName) => {
    cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
        cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
        cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
        cy.wrap(callbackResponse.details.fee).as('callback_fee');
        cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        cy.wrap(callbackResponse.status).as('callback_status');
    });

    const sheetCells = {
        transactionNumber: `B${sheetRow}`,
        merchantName: `C${sheetRow}`,
        customerName: `D${sheetRow}`,
        creditAmount: `E${sheetRow}`,
        fee: `F${sheetRow}`,
        totalAmount: `G${sheetRow}`,
        status: `H${sheetRow}`,
    };

    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: `A${sheetRow}`, value: sheetRow - 1 });
    readFileCallback.getTransactionNum().then((transaction_number) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.transactionNumber, value: transaction_number });
    });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: Cypress.env('merchant_name') });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.customerName, value: Cypress.env('customer_name') });
    readFileCallback.getCreditAmount().then((amount) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.creditAmount, value: amount });
    });
    readFileCallback.getFee().then((fee) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.fee, value: fee });
    });
    readFileCallback.getTotalAmount().then((net_amount) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalAmount, value: net_amount });
    });
    readFileCallback.getStatus().then((status) => {
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: status });
    });
};
