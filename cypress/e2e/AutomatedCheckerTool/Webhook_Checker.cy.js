import { common } from "../../fixtures/prd/common";
import filterTransactions from '../../functions/processedDateChecker/filterTransactions';
import fetchTransactionData from '../../functions/processedDateChecker/base_date_storage';
import LoginPageTest from '../../pages/loginPage';
import SidebarMenuTest from '../../pages/sidebarMenu';
import TransactionPageTest from '../../pages/transactionPage';
// npx cypress run --spec "cypress/e2e/AutomatedCheckerTool/*"
// npx cypress run --spec "cypress/e2e/AutomatedCheckerTool/Webhook_Checker.cy.js"
// npx cypress open

Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err) => {
    // Handle specific errors gracefully
    if (err.message.includes('canceled') || err.message.includes('specific error message to ignore')) {
        return false;
    }
    return true;
});

const filpath = 'cypress/e2e/Reports/AutomatedCheckerTool/Webhook_Checker.xlsx'; //changed to excel path file
const sheetName = "WEBHOOK CHECKER";
const pageLength = 50;

const PageNav = Array.from({ length: pageLength }, (_, i) => i + 1);

const login = new LoginPageTest();
const sideMenu = new SidebarMenuTest();
const transactions = new TransactionPageTest();

describe('Processed Date', () => {
    PageNav.forEach((pageNav) => {
        it(`Checked all transactions for Page: ${pageNav}`, () => {
            // Login
            cy.visit(common.login_url);
            login.getEmailField().type(common.adminEmail);
            login.getPasswordField().type(common.adminPass);
            login.getSubmitButton().click();

            // Navigate to transaction page
            sideMenu.getTransactionModule().click();
            sideMenu.getTransactionSubModule().click();

            // Filter transactions
            filterTransactions(2, pageNav, { timeout: 5500 });
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
                                                fetchTransactionData(x,'getTransactionTransactionProcessedDate' , 'getTransactionTransactionNumber', 'getTransactionMerchantNumber',
                                                    'getTransactionMerchantName', 'getTransactionCustomerName', 'getTransactionType', 'getTransactionMethod', 'getTransactionVendor',
                                                    'getTransactionSolution', 'getTransactionStatus', 'getTransactionAmount', 'getTransactionNetAmount');

                                                cy.get('@transaction_number').then((transactionNumber) => {
                                                    validateProcessedDate(x, startRow + x - 1, filpath, sheetName);
                                                    writeInGoogleSheet(transactionNumber, filpath, startRow + x - 1, sheetName);
                                                    cy.task('log', transactionNumber);
                                                });
                                            } else {
                                                cy.log("No transaction found at row " + x);
                                            }
                                        });
                                    }
                                    cy.wait(5000);
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

const validateProcessedDate = (x, sheetRow, filpath, sheetName) => {
    const sheetCells = {
        remarks: `G${sheetRow}`
    };

    let processed_date = Cypress.env('processed_date');
    let status = Cypress.env('status');
    cy.log("Processed Date: " + processed_date);
    cy.log("Status: " + status);

    if (status === 'pending') {
        try {
            transactions.getTransactionTransactionProcessedDate(x).should('have.text', '')
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `PASSED` });
        } catch (error) {
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `FAILED` });
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, remarks: `The status is ${status} but has processed date.` });
        }
    } else {
        try {
            transactions.getTransactionTransactionProcessedDate(x).should('not.have.text', '')
            cy.log("Processed Date: " + processed_date);
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `PASSED` });
        } catch (error) {
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `FAILED` });
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, remarks: `The status is ${status} but no processed date.` });
        }
    }
};

const writeInGoogleSheet = (transaction_number, filpath, sheetRow, sheetName) => {
    const sheetCells = {
        transactionNumber: `B${sheetRow}`,
        merchantName: `C${sheetRow}`,
        customerName: `D${sheetRow}`,
        status: `E${sheetRow}`,
        processedDate: `F${sheetRow}`
    };

    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: `A${sheetRow}`, value: sheetRow - 1 });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.transactionNumber, value: transaction_number });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: Cypress.env('merchant_name') });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.customerName, value: Cypress.env('customer_name') });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: Cypress.env('status') });
    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.processedDate, value: Cypress.env('processed_date') });
};
