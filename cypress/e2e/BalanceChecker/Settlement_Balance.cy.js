import { common } from "../../fixtures/prd/common";
// import {LoginPageTest, SidebarMenuTest, AccountsPageTest} from "../../fixtures/prd/locators";
import { sidebarmenu_locators, accountspage_locators,
    accountdetails_locators, settlement_locators, transactionpage_locators } from "../../fixtures/prd/locators";
import filterTransactions from '../../functions/balanceChecker/filterTransactions';
import AccountsPageTest from '../../pages/accountPage';
import LoginPageTest from '../../pages/loginPage';
import SidebarMenuTest from '../../pages/sidebarMenu';
import AccountDetailsPageTest from '../../pages/accountDetailsPage';
import SettlementPage from '../../pages/settlementPage';
import TransactionPageTest from '../../pages/transactionPage';

import moment from 'moment';
const { categorizeSettlementRows } = require('../../functions/balanceChecker/settlementUtils');
// npx cypress run --spec "cypress/e2e/BalanceChecker/*"
// npx cypress run --spec "cypress/e2e/BalanceChecker/Settlement_Balance.cy.js"
// npx cypress open

Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('canceled') || err.message.includes('specific error message to ignore')) {
        return false;
    }
    return true;
});

/**
 * Formats a number as a currency string in 'en-US' locale with two decimal places.
 * @param {number} amount - The amount to be formatted.
 * @returns {string} - The formatted currency string.
*/
function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Parses a date string in the format 'YY/MM/DD HH:MM:SS' and returns a formatted date string in the format 'YYYY/MM/DD'.
 *
 * @param {string} dateString - The date string to parse, in the format 'YY/MM/DD HH:MM:SS'.
 * @returns {string} - The formatted date string in the format 'YYYY/MM/DD'.
*/

const exportFilePath = 'cypress/downloads/settlement_details.xlsx';
const transactionFilePath = 'cypress/downloads/transaction_exported.csv';
const filpath = 'cypress/e2e/Reports/BalanceChecker/Settlement_Balance.xlsx'; //changed to excel path file
const sheetName = "SETTLEMENT BALANCE";
const merchantlist = ["EXNESS LIMITED"];
// const merchantlist = ["FooBar Prod"];
// const merchantlist = [
//     "EXNESS LIMITED",
//     "RIVALRY LIMITED",
//     "TECHSOLUTIONS (CY) GROUP LIMITED",
//     "TECHOPTIONS (CY) GROUP LIMITED",
//     "ZOTA TECHNOLOGY PTE LTD"
// ];
const Merchants = merchantlist.slice();

const login = new LoginPageTest();
const sideMenu = new SidebarMenuTest();
const accounts = new AccountsPageTest();
const accountDetails = new AccountDetailsPageTest();
const settlement = new SettlementPage();
const transactions = new TransactionPageTest();


describe('Assert Exported File', () => {
    let currentRow = 2;
    Merchants.forEach((merchant) => {
    it.only(`Settlement balance: ${merchant}`, () => {
        cy.task('deleteFile', transactionFilePath).then((message) => {
            cy.log(message);
        });

        // Login
        cy.visit(common.login_url);
        login.getEmailField().type(common.adminEmail);
        login.getPasswordField().type(common.adminPass);
        login.getSubmitButton().click();

        // Navigate to the transaction page
        sideMenu.getAccountsModule().should('be.visible').click();
        // search the merchant name
        accounts.getAccountSearchFilter().type(merchant)
        cy.wait(3500)

        if (merchant === 'TECHSOLUTIONS (CY) GROUP LIMITED') {
            // click account number
            accounts.getAccountAccountNumberData2ndRow().click()
        }else{
            // click account number
            accounts.getAccountAccountNumberData().click()
        }

        // click sitolment tab
        accountDetails.getAccountDetailsSettlementTab({timeout: 10000}).click();
        settlement.getSettlementSolutionMenu({timeout:10000}).contains('QRPH').click();

        transactions.getTransactionTableRow({timeout:10000}).its('length').then((rowCount) => {

            // let startRow = (pageNav - 1) * 20 + 1;
            const rowcount = rowCount+1;
            // Utility function to generate locator string
            const getLocator = (x, baseLocator) => `${settlement_locators.locator_base1}${x}${settlement_locators.locator_base2}${baseLocator}`;
            for (let x = 2; x <= rowcount; x++) {
                const checkbox = getLocator(x, settlement_locators.settlement_checkbox);
                // const recordTime = getLocator(x, settlement_locators.settlement_recordtime);
                // const cutoff = getLocator(x, settlement_locators.settlement_cutoff);
                const recordTime = settlement.getSettlementRecordTime(x)
                const cutoff = settlement.getSettlementCutoff(x)
                const accountnumber = getLocator(x, settlement_locators.settlement_accountnumber);
                const accountname = getLocator(x, settlement_locators.settlement_accountname);
                const settlementTransactionNum = getLocator(x, settlement_locators.settlement_transaction_num);
                const status = getLocator(x, settlement_locators.settlement_status);

                settlement.getSettlementStatus(x).invoke('text').then((settlement_status)=>{
                    if (settlement_status === 'completed') {
                        cy.log(`Skip settlement status: ${settlement_status}.`);
                        return;
                    }
                    settlement.getSettlementCheckbox(x, {timeout: 3250}).click();
                    // Click the export button
                    cy.get(':nth-child(7) > .rs-btn > div', { timeout: 10000, delay: 1200}).click();
                    cy.wait(1500);

                    // Wait for the button to change to "Download file"
                    cy.get(':nth-child(7) > .rs-btn > div', { timeout: 100000 })
                    .should('have.text', 'Download file').then((exportbutton) => {
                        // Click the download button now that it is available
                        cy.get(exportbutton).click();
                    });

                    processSettlementData(exportFilePath, '1');

                    const sheetCells = {
                        accountNumber: `C${currentRow}`,
                        merchantName: `D${currentRow}`,
                        settlementTransactionNo: `E${currentRow}`,

                        totalAmount: `F${currentRow}`,
                        totalNetAmount: `G${currentRow}`,
                        settlementStatus: `H${currentRow}`,
                        settlementDetails: `I${currentRow}`,
                        exportedTransactions: `J${currentRow}`,
                        remarks: `K${currentRow}`,
                    };

                    // Settlement Details
                    cy.task('parseXLSX', { exportFilePath: exportFilePath, sheetIndex: '0' }).then((data) => {
                        const results = processSettlementRows(data);
                        cy.wrap(results.totalApprovedTransactions).as('ApprovedTransactions');
                        cy.wrap(results.totalRefundTransactions).as('RefundTransactions');
                        cy.wrap(results.totalCBTransactions).as('CBTransactions');
                        cy.wrap(results.totalRRReturn).as('RRReturn');
                        cy.wrap(results.totalCreditAdjustment).as('CreditAdjustment');
                        cy.wrap(results.totalTotalAmount).as('Total');
                        //deductions
                        cy.wrap(results.totalMDRFee).as('MDRFee');
                        cy.wrap(results.totalFixedFee).as('FixedFee');
                        cy.wrap(results.totalRefundFee).as('RefundFee');
                        cy.wrap(results.totalCBFee).as('CBFee');
                        cy.wrap(results.totalRetrievalFee).as('RetrievalFee');
                        cy.wrap(results.totalRollingReserve).as('RollingReserve');
                        cy.wrap(results.totalOtherFees).as('OtherFees');
                        cy.wrap(results.totalDeductions).as('TotalDeductions');
                        cy.wrap(results.totalAmountNetOfFees).as('totalAmountNetOfFees');
                        cy.wrap(results.totalSettlementFee).as('SettlementFee');
                        cy.wrap(results.totalSettledAmount).as('TotalSettledAmount');
                        //computations
                        cy.wrap(results.computedTotal).as('ComputedTotal');
                        cy.wrap(results.computedAdjustments).as('ComputedAdjustments');
                        cy.wrap(results.computedDeductions).as('ComputedDeductions');
                        cy.wrap(results.computedNetofFees).as('ComputedNetofFees');
                        cy.wrap(results.computedTotalSettledAmount).as('ComputedTotalSettledAmount');
                        cy.wrap(results.computedTotalSettledAmountRegTransaction).as('ComputedTotalSettledAmountRegTransaction');

                        settlement.getSettlementAccountNumber(x).invoke('text').then((accountNumber) => {
                            //account number
                            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.accountNumber, value: accountNumber });
                        });

                        settlement.getSettlementAccountName(x).invoke('text').then((merchantName) => {
                            //merchant name
                            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: merchantName });
                        });

                        settlement.getSettlementTransactionNumber(x).invoke('text').then((settlementTransactionNo) => {
                            //merchant name
                            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementTransactionNo, value: settlementTransactionNo });
                        });

                    });

                    //totalSettlmentAmountRegularTransactions vs ApprovedTransactions
                    cy.get('@totalSettlmentAmountRegularTransactions').then((totalSettlmentAmountRegularTransactions) => {
                        cy.get('@ApprovedTransactions').then((ApprovedTransactions) => {
                            expect(totalSettlmentAmountRegularTransactions).to.equal(ApprovedTransactions);
                        });
                    });

                    //ComputedTotal vs Total
                    cy.get('@ComputedTotal').then((ComputedTotal) => {
                        cy.get('@Total').then((Total) => {
                            expect(ComputedTotal).to.equal(Total);
                        });
                    });

                    //ComputedDeductions vs TotalDeductions
                    cy.get('@ComputedDeductions').then((ComputedDeductions) => {
                        cy.get('@TotalDeductions').then((TotalDeductions) => {
                            expect(ComputedDeductions).to.equal(TotalDeductions);
                        });
                    });

                    //totalSettledAmountRegularTransactions vs totalAmountNetOfFees
                    cy.get('@ComputedTotalSettledAmountRegTransaction').then((ComputedTotalSettledAmountRegTransaction) => {
                        cy.get('@totalSettledAmountRegularTransactions').then((totalSettledAmountRegularTransactions) => {
                            expect(ComputedTotalSettledAmountRegTransaction).to.equal(totalSettledAmountRegularTransactions);
                        });
                    });

                    //ComputedNetofFees vs totalSettledAmountRegularTransactions
                    cy.get('@ComputedNetofFees').then((ComputedNetofFees) => {
                        cy.get('@totalAmountNetOfFees').then((totalAmountNetOfFees) => {
                            expect(ComputedNetofFees).to.equal(totalAmountNetOfFees);
                        });
                    });

                    //ComputedTotalSettledAmount vs TotalSettledAmount
                    cy.get('@ComputedTotalSettledAmount').then((ComputedTotalSettledAmount) => {
                        cy.get('@TotalSettledAmount').then((TotalSettledAmount) => {
                            expect(ComputedTotalSettledAmount).to.equal(TotalSettledAmount);
                        });
                    });
                    
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementDetails, value: "PASSED" });

                    GetDateRange(currentRow, recordTime, cutoff).then((dateRange) => {
                        cy.wrap(dateRange).as('dateRange');
                        cy.log(`The date range is: ${dateRange}`);
                        // cy.get(sidebarmenu_locators.transaction_module, {timeout: 10000}).click();
                        // cy.get(sidebarmenu_locators.transaction_submodule, {timeout: 10000}).click();
                        sideMenu.getTransactionModule({timeout: 10000}).click();
                        sideMenu.getTransactionSubModule({timeout: 10000}).click();
                        cy.wait(1500);
                        filterTransactions(merchant, 'getTransactionTypeDeposit', 'getTransactionAllBankVendor', 'getTransactionQRPHSolution', { timeout: 10000 });
                        //process date filter
                        cy.get(':nth-child(10) > .w-full > .rs-picker-toggle > .rs-stack > [style="flex-grow: 1; overflow: hidden;"] > .rs-picker-toggle-textbox').click().type(dateRange, { timeout: 10000 });
                        //click ok
                        cy.get('.rs-picker-toolbar-right > .rs-btn', {timeout:10000, delay:5000}).click();
                    });

                    // Click the export button
                    cy.get('.space-x-3 > .rs-btn > div', { timeout: 10000, interval: 1200 }).click();
                    // Wait for the button to change to "Download file"
                    cy.get('.space-x-3 > .rs-btn > div', { timeout: 100000 }).should('have.text', 'Download file').then(() => {
                        // Click the download button now that it is available
                        cy.get('.space-x-3 > .rs-btn > div').click();
                    });
                    //delete settlement details file
                    cy.task('deleteFile', exportFilePath).then((message) => {
                        cy.log(message);
                    });

                    // rename the downloaded file
                    cy.task('findAndRenameLatestFile', {
                        directoryPath: 'cypress/downloads',
                        newFileName: `transaction_exported.csv`
                    }).then((message) => {  
                        cy.log(message)
                    });

                    processCompletedTransactions(transactionFilePath).then(({ totalCompletedAmount, totalCompletedNetAmount }) => {
                        cy.wrap(totalCompletedAmount).as('TotalCompletedAmount');
                        cy.wrap(totalCompletedNetAmount).as('TotalCompletedNetAmount');
                    
                        // TotalCompletedAmount vs ApprovedTransactions
                        cy.get('@ApprovedTransactions').then((ApprovedTransactions) => {
                            cy.get('@TotalCompletedAmount').then((TotalCompletedAmount) => {
                                expect(ApprovedTransactions).to.equal(TotalCompletedAmount);
                                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalAmount, value: TotalCompletedAmount });
                            });
                        });
                    
                        // totalSettledAmountRegularTransactions vs TotalCompletedNetAmount
                        cy.get('@totalSettledAmountRegularTransactions').then((totalSettledAmountRegularTransactions) => {
                            cy.get('@TotalCompletedNetAmount').then((TotalCompletedNetAmount) => {
                                expect(totalSettledAmountRegularTransactions).to.equal(TotalCompletedNetAmount);
                                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalNetAmount, value: TotalCompletedNetAmount });
                            });
                        });
                    });
                        
                    cy.reload();
                    // // Navigate to the transaction page
                    // cy.get(sidebarmenu_locators.accounts_module, {timeout: 10000}).should('be.visible').click();
                    // // search the merchant name
                    // cy.get(accountspage_locators.accounts_search_filter, {timeout: 10000}).type(merchant)
                    sideMenu.getAccountsModule({timeout: 10000}).should('be.visible').click();
                    accounts.getAccountSearchFilter({timeout: 10000}).type(merchant);
                    cy.wait(3500)
                    if (merchant === 'TECHSOLUTIONS (CY) GROUP LIMITED') {
                        // click account number
                        cy.get('[aria-rowindex="3"] > .rs-table-cell-group > .rs-table-cell-first > .rs-table-cell-content > a', {timeout: 10000}).click()
                    }else{
                        // click account number
                        cy.get(".rs-table-cell-content > a", {timeout: 10000}).click()
                    }
                    // click sitolment tab
                    // cy.get(accountdetails_locators.settlement_tab, {timeout: 10000}).click()
                    // cy.get(settlement_locators.solution_menu, {timeout: 10000}).contains('QRPH').click();

                    accountDetails.getAccountDetailsSettlementTab({timeout: 10000}).click();
                    settlement.getSettlementSolutionMenu({timeout: 10000}).contains('QRPH').click();

                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementStatus, value: settlement_status });
                    settlement.getSettlementStatus(x).invoke('text').then((settlement_status) => {
                        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementStatus, value: settlement_status });
                        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.exportedTransactions, value: "PASSED" });
                    });

                    currentRow++;
                    cy.log(`The settlement status is: ${settlement_status}.`);
                });
            }
        });
    }); //end of it
});//end of each merchant loop
});//end of describe

const GetDateRange = (index, recordTime, cutoff) => {
    const sheetCells = {
        settlementDate: `A${index}`,
        settlementCutoff: `B${index}`,
    };
    // This returns a Cypress chainable, not just a plain promise.
    return recordTime.invoke('text').then((recordtime) => {
        cy.log(recordtime);

        // Split the string by spaces and then by slashes
        const record_dateParts = recordtime.split(' ')[0].split('/');
        
        // Extract the numbers
        const record_year = record_dateParts[0]; // 24
        const record_month = record_dateParts[1]; // 07
        const record_day = record_dateParts[2]; // 28

        const settlement_record_date = '20' + record_year + '/' + record_month + '/' + record_day;
    
        // Chain another cy.get() for the cutoff element
        return cutoff.invoke('text').then((settlement_cutoff) => {
            let settlement_cutoff_date;

            if (!settlement_cutoff) {
                cy.log('No settlement cut-off');
                const dateToday = moment().format('L');
                const dateToday_dateParts = dateToday.split(' ')[0].split('/');

                // Extract the numbers
                const cutoff_year = dateToday_dateParts[2];
                const cutoff_month = dateToday_dateParts[0];
                const cutoff_day = dateToday_dateParts[1];

                settlement_cutoff_date = cutoff_year + '/' + cutoff_month + '/' + cutoff_day;
            } else {
                const cutoff_dateParts = settlement_cutoff.split(' ')[0].split('/');
                const cutoff_year = cutoff_dateParts[0]; // 28
                const cutoff_month = cutoff_dateParts[1]; // 07
                const cutoff_day = cutoff_dateParts[2]; // 24

                settlement_cutoff_date = '20' + cutoff_year + '/' + cutoff_month + '/' + cutoff_day;
            }

            cy.log(`The settlement record date: ` + settlement_record_date);
            cy.log(`The settlement cut-off date: ` + settlement_cutoff_date);

            const dateRange = settlement_record_date + ' ~ ' + settlement_cutoff_date;
            
            //settlement date
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementDate, value: settlement_record_date });
            //settlement cutoff
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementCutoff, value: settlement_cutoff_date });

            // Wrap the final dateRange to make it accessible for later Cypress commands
            return dateRange;
        });
    });
};

function processSettlementData(exportFilePath, sheetIndex) {
    return cy.task('parseXLSX', { exportFilePath: exportFilePath, sheetIndex: sheetIndex }).then((data) => {
        const approvedTransactions = data.filter(row => row['Settlement Type']?.trim().toLowerCase() === 'approved transaction');

        const totalApprovedSettledAmount = approvedTransactions.reduce((sum, row) => {
            const totalSettledAmount = parseFloat(row['Total Settled Amount'].replace(/PHP |,/g, '')); // Use 'Net Amount'
            return sum + (totalSettledAmount < 0 ? 0 : totalSettledAmount); // Replace negative values with 0
        }, 0);

        const totalApprovedTotal = approvedTransactions.reduce((sum, row) => {
            const totalSettlementAmount = parseFloat(row['Settlement Amount'].replace(/PHP |,/g, '')); // Use 'Net Amount'
            return sum + totalSettlementAmount;
        }, 0);

        const totalSettledAmountRegularTransactions = formatCurrency(totalApprovedSettledAmount);
        const totalSettlmentAmountRegularTransactions = formatCurrency(totalApprovedTotal);

        cy.wrap(totalSettledAmountRegularTransactions).as('totalSettledAmountRegularTransactions');
        cy.wrap(totalSettlmentAmountRegularTransactions).as('totalSettlmentAmountRegularTransactions');
    });
}

function processSettlementRows(data) {
    const settlementRows = categorizeSettlementRows(data);
    // Calculate totals for each category using a single pass for performance
    const getTotalAmount = (rows, field) => rows.reduce((sum, row) => sum + parseFloat(row[field] || 0), 0);

    const totalApprovedTransactions = getTotalAmount(settlementRows.approvedTransactions, 'Amount');
    const totalRefundTransactions = getTotalAmount(settlementRows.refundTransactions, 'Amount');
    const totalCBTransactions = getTotalAmount(settlementRows.cbTransactions, 'Amount');
    const totalRRReturn = getTotalAmount(settlementRows.rrReturn, 'Amount');
    const totalCreditAdjustment = getTotalAmount(settlementRows.creditAdjustment, 'Amount');
    const totalTotalAmount = getTotalAmount(settlementRows.total, 'Amount');

    //deductions
    const totalMDRFee = getTotalAmount(settlementRows.mdrFee, 'Count');
    const totalFixedFee = getTotalAmount(settlementRows.fixedFee, 'Count');
    const totalRefundFee = getTotalAmount(settlementRows.refundFee, 'Count');
    const totalCBFee = getTotalAmount(settlementRows.cbFee, 'Count');
    const totalRetrievalFee = getTotalAmount(settlementRows.retrievalFee, 'Count');
    const totalRollingReserve = getTotalAmount(settlementRows.rollingReserve, 'Count');
    const totalOtherFees = getTotalAmount(settlementRows.otherFees, 'Count');
    const totalDeductions = getTotalAmount(settlementRows.totalDeductions, 'Count');
    const totalAmountNetOfFees = getTotalAmount(settlementRows.totalNetofFees, 'Count');
    const totalSettlementFee = getTotalAmount(settlementRows.settlementFee, 'Count');
    const totalSettledAmount = getTotalAmount(settlementRows.totalSettledAmount, 'Count');

    const computedTotal = totalApprovedTransactions + totalRefundTransactions + totalCBTransactions + totalRRReturn + totalCreditAdjustment;
    const computedDeductions = totalMDRFee + totalFixedFee + totalRefundFee + totalCBFee + totalRetrievalFee + totalRollingReserve + totalOtherFees;
    const computedNetofFees = computedTotal - computedDeductions;
    const computedTotalSettledAmount = computedNetofFees - totalSettlementFee;

    const computedAdjustments = totalRefundTransactions + totalCBTransactions + totalRRReturn + totalCreditAdjustment;
    const computedTotalSettledAmountRegTransaction = computedNetofFees - computedAdjustments;

    const formatAmount = (amount) => formatCurrency(amount);

    return {
        totalApprovedTransactions: formatAmount(totalApprovedTransactions),
        totalRefundTransactions: formatAmount(totalRefundTransactions),
        totalCBTransactions: formatAmount(totalCBTransactions),
        totalRRReturn: formatAmount(totalRRReturn),
        totalCreditAdjustment: formatAmount(totalCreditAdjustment),
        totalTotalAmount: formatAmount(totalTotalAmount),
        totalMDRFee: formatAmount(totalMDRFee),
        totalFixedFee: formatAmount(totalFixedFee),
        totalRefundFee: formatAmount(totalRefundFee),
        totalCBFee: formatAmount(totalCBFee),
        totalRetrievalFee: formatAmount(totalRetrievalFee),
        totalRollingReserve: formatAmount(totalRollingReserve),
        totalOtherFees: formatAmount(totalOtherFees),
        totalDeductions: formatAmount(totalDeductions),
        totalAmountNetOfFees: formatAmount(totalAmountNetOfFees),
        totalSettlementFee: formatAmount(totalSettlementFee),
        totalSettledAmount: formatAmount(totalSettledAmount),
        computedTotal: formatAmount(computedTotal),
        computedAdjustments: formatAmount(computedAdjustments),
        computedDeductions: formatAmount(computedDeductions),
        computedNetofFees: formatAmount(computedNetofFees),
        computedTotalSettledAmount: formatAmount(computedTotalSettledAmount),
        computedTotalSettledAmountRegTransaction: formatAmount(computedTotalSettledAmountRegTransaction)
    };
}

const processCompletedTransactions = (transactionFilePath) => {
    return cy.task('parseCSV', transactionFilePath).then((data) => {
        // Assuming 'data' contains the rows of the spreadsheet
        const completedTransactions = data.filter(row => row['Status']?.trim().toLowerCase() === 'completed');
        
        // Calculate total amounts after filtering duplicates
        const totalCompletedAmountFilter = completedTransactions.reduce((sum, row) => {
            const totalAmount = parseFloat(row['Amount'].replace(/PHP |,/g, '')); // Use 'Amount'
            return sum + totalAmount;
        }, 0);
        
        const totalCompletedNetAmountFilter = completedTransactions.reduce((sum, row) => {
            const totalNetAmount = parseFloat(row['Net Amount'].replace(/PHP |,/g, '')); // Use 'Net Amount'
            return sum + totalNetAmount;
        }, 0);
        
        // Format the results and store them
        const totalCompletedAmount = formatCurrency(totalCompletedAmountFilter);
        const totalCompletedNetAmount = formatCurrency(totalCompletedNetAmountFilter);
        
        return {
            totalCompletedAmount,
            totalCompletedNetAmount
        };
    });
};