import { common } from "../../../fixtures/prd/common";
import filterTransactions from '../../../functions/liveTransactionChecker/filterTransactions';
import fetchTransactionData from '../../../functions/liveTransactionChecker/base_date_storage';
import LoginPageTest from '../../../pages/loginPage';
import SidebarMenuTest from '../../../pages/sidebarMenu';
import TransactionPageTest from '../../../pages/transactionPage';
import TransactionDetailsPageTest from '../../../pages/transactionDetailsPage';
import { ReadFilePayload, ReadFileCallback } from '../../../apiResponse/readFileResponse';

// npx cypress run --spec "cypress/e2e/TransactionChecker/Deposit/*"
// npx cypress run --spec "cypress/e2e/TransactionChecker/Deposit/LBTTHB_DEPOSIT.cy.js"
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

// const sheetId = '1vd-uTQXSUgrAc5hoE_du2Zxvw6toE9gEWpjpWxcdwIk';
const filpath = 'cypress/e2e/Reports/LiveTransactionChecker/LiveTransactionChecker.xlsx'; //changed to excel path file
const sheetName = 'TOPPAY LBT THB';
const pageLength = 5;

const PageNav = Array.from({ length: pageLength}, (_, i) => i + 1);

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

            // Navigate to the transaction page
            sideMenu.getTransactionModule().click();
            sideMenu.getTransactionSubModule().click();
            
            // Filter transactions
            filterTransactions('getTransactionTypeDeposit', 'getTransactionTopPayVendor', 'getTransactionLbtThaiSolution', 1, pageNav, { timeout: 5500 });
            try {
                transactions.getTransactionBody().then(($body) => {
                    if ($body.find('.rs-pagination-btn-active').length) {
                        transactions.getTransactionPageNavigationLandingPage().invoke('text').then((active_page_num)=>{
                        if(pageNav == active_page_num){
                            transactions.getTransactionTableRow().its('length').then((rowCount) => {
                                let startRow = (pageNav - 1) * 20 + 1;
                                for (let x = 2; x <= rowCount+1; x++) {
                                    transactions.getTransactionTransactionNumber(x).then((isTransactionExist) => {
                                        console.log("isTransactionExist is existing: "+isTransactionExist);
                                        if (isTransactionExist) {
                                            fetchTransactionData(x, 'getTransactionTransactionNumber', 'getTransactionMerchantNumber', 'getTransactionMerchantName',
                                                'getTransactionCustomerName', 'getTransactionType', 'getTransactionMethod', 'getTransactionVendor', 'getTransactionSolution',
                                                'getTransactionStatus', 'getTransactionAmount', 'getTransactionNetAmount');

                                            cy.get('@transaction_number').then((transactionNumber) => {
                                                validateTransactionDetails(transactionNumber, pageNav, x, startRow, filpath, sheetName);
                                                validateWebhookResponses(filpath, sheetName, startRow + x - 1);
                                                writeInGoogleSheet(filpath, startRow + x - 1, sheetName);
                                                cy.task('log', transactionNumber);
                                            });
                                        } else {
                                            cy.log("No transaction found at row " + x);
                                        }
                                        cy.go('back', { timeout: 5000 });
                                        cy.wait(3500);
                                        filterTransactions('getTransactionTypeDeposit', 'getTransactionTopPayVendor', 'getTransactionLbtThaiSolution', 1, pageNav, { timeout: 5500 });
                                    })
                                }
                            });
                        }else{
                            cy.log("No page found");
                        }
                        })
                    } else {
                        cy.log('No transaction found, skipping the test...');
                        return; // Skip the rest of the test for this transaction
                    }
                });
            }catch(error){
                console.log(error.message)
            }
        });
    });
});


const validateTransactionDetails = (transactionNumber, pageNav, row, startRow, filpath, sheetName) => {
    try{
        cy.visit(`https://portal.paystage.net/${transactionNumber}/transactions`).wait(5200);
        const storedStatus = Cypress.env('status');
        if (storedStatus !== 'completed') {
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

            transactiondetails.getViewRequest().first().contains('View request').click();
            transactiondetails.getModalContent().invoke('text').then((sent_payload_completed) => {
                cy.writeFile(data_response_holder.rwCompleted, sent_payload_completed);
            });
            validateWebhookResponses(filpath, sheetName, startRow + row - 1);
            return; // Skip the rest of the test for this transaction
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
    }catch(error){
        console.log(error.message)
    }
};

const validateWebhookResponses = (filpath, sheetName, sheetRow) => {
    const resultCell = `I${sheetRow}`;
    const storedStatus = Cypress.env('status');

    if (storedStatus !== 'completed') {
        cy.log(`Skip test as Jpay Deposit status is ${storedStatus}.`);
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        readFileCallback.getMerchantRef().then((callback_merrefno) => {
            transactiondetails.getMerchantNumber().should('be.visible').and('have.text', callback_merrefno);
        });
        readFileCallback.getStatus().then((callback_status) => {
            transactiondetails.getStatus().should('be.visible').and('have.text', callback_status);
        });
        readFileCallback.getCustomerMobile().then((callback_customer_mobile) => {
            transactiondetails.getMobile().should('be.visible').and('have.text', callback_customer_mobile);
        });
        readFileCallback.getCreditAmount().then((callback_credit_amount) => {
            const amount = parseInt(callback_credit_amount)
            transactiondetails.getSettlementAmount().invoke('text').then((settlement_amount)=>{
                const trimmedSettlementAmount = settlement_amount
                .replace('THB ', '') // Remove "THB "
                .replace(/,/g, '')   // Remove commas
                expect(parseInt(trimmedSettlementAmount)).to.equal(amount);
            })
            readFileCallback.getTotalAmount().then((callback_total_amount)=>{
                transactiondetails.getSettlementTotalAmount().invoke('text').then((settlement_totalamount)=>{
                    const trimmedSettlementTotalAmount = settlement_totalamount
                    .replace('THB ', '') // Remove "THB "
                    .replace(/,/g, '')   // Remove commas
                    expect(parseInt(trimmedSettlementTotalAmount)).to.equal(callback_total_amount);
                })
            })
            
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

    try{
        cy.readFile(data_response_holder.rwPayload).then((payloadResponse) => {
            cy.wrap(payloadResponse.transaction.transaction_number).as('payload_transaction_number');
            cy.wrap(payloadResponse.transaction.reference_no).as('payload_merrefno');
            cy.wrap(payloadResponse.phone).as('payload_mobile');
            cy.wrap(payloadResponse.transaction.amount).as('payload_amount');
            cy.wrap(payloadResponse.transaction.settlement_details.total_fee).as('payload_fee');
            cy.wrap(payloadResponse.transaction.settlement_details.total_amount).as('payload_total_amount');
        });
        cy.readFile(data_response_holder.rwCompleted).then((callbackResponse) => {
            cy.wrap(callbackResponse.transaction_number).as('callback_transaction_number');
            cy.wrap(callbackResponse.reference_no).as('callback_merrefno');
            cy.wrap(callbackResponse.status).as('callback_status');
            cy.wrap(callbackResponse.customer.mobile).as('callback_customer_mobile');
            cy.wrap(callbackResponse.details.credit_amount).as('callback_credit_amount');
            cy.wrap(callbackResponse.details.fee).as('callback_fee');
            cy.wrap(callbackResponse.details.total_amount).as('callback_total_amount');
        });
        readFilePayload.getTransactionNum().then((payload_transaction_number) => {
            readFileCallback.getTransactionNum().should((callback_transaction_number) => {
                expect(payload_transaction_number).to.eq(callback_transaction_number);
            });
        });
        readFilePayload.getMerchantRef().then((payload_merrefno) => {
            readFileCallback.getMerchantRef().should((callback_merrefno) => {
                expect(payload_merrefno).to.eq(callback_merrefno);
            });
        });
        readFilePayload.getAmount().then((payload_amount) => {
            readFileCallback.getFee().then((callback_fee) => {
                readFileCallback.getCreditAmount().then((callback_credit_amount) => {
                    readFileCallback.getTotalAmount().should((callback_total_amount) => {
                        let amount = parseInt(payload_amount);
                        let fee = parseInt(callback_fee);
                        let creditAmount = parseInt(callback_credit_amount);
                        let totalAmount = parseInt(callback_total_amount)
                        let netAmount = creditAmount - fee
                        expect(amount).to.eq(creditAmount);
                        expect(totalAmount).to.eq(netAmount);
                    });     
                });     
            });
        });
        readFilePayload.getFee().then((payload_fee) => {
            readFileCallback.getFee().should((callback_fee) => {
                let payloadFee = parseInt(payload_fee)
                expect(payloadFee).to.eq(callback_fee);
            });
        });
        readFileCallback.getStatus().then((callback_status) => {
            const storedStatus = Cypress.env('status')
            expect(callback_status).to.eq(storedStatus);
        });
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: resultCell, value: 'PASSED'});
    } catch(error){
        cy.log("error")
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
}
