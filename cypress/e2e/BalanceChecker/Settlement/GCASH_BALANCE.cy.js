import { common } from "../../../fixtures/prd/common";
import filterTransactions from '../../../functions/balanceChecker/filterTransactions';
import AccountsPageTest from '../../../pages/accountPage';
import LoginPageTest from '../../../pages/loginPage';
import SidebarMenuTest from '../../../pages/sidebarMenu';
import AccountDetailsPageTest from '../../../pages/accountDetailsPage';
import SettlementPage from '../../../pages/settlementPage';
import TransactionPageTest from '../../../pages/transactionPage';
import moment from 'moment';
const { categorizeSettlementRows } = require('../../../functions/balanceChecker/settlementUtils');

// npx cypress run --spec "cypress/e2e/BalanceChecker/Settlement/*"
// npx cypress run --spec "cypress/e2e/BalanceChecker/Settlement/GCASH_BALANCE.cy.js"
// npx cypress open

Cypress.on('uncaught:exception', (err) => {
        // Handle specific errors gracefully
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
const sheetName = "GCASH BALANCE";
// const merchantlist = ["EXNESS LIMITED"];
// const merchantlist = ["FooBar Prod"];
const merchantlist = [
    // "EXNESS LIMITED",
    "RIVALRY LIMITED",
    "ZOTA TECHNOLOGY PTE LTD"
];
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
    it(`Settlement balance: ${merchant}`, () => {
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
        accountDetails.getAccountDetailsSettlementTab().click();
        settlement.getSettlementSolutionMenu().contains('GCash').click();
        transactions.getTransactionTableRow().its('length').then((rowCount) => {
            const rowcount = rowCount+1;
            for (let x = 2; x <= rowcount; x++) {
                const recordTime = settlement.getSettlementRecordTime(x)
                const cutoff = settlement.getSettlementCutoff(x)

                settlement.getSettlementStatus(x).invoke('text').then((settlement_status)=>{
                    if (settlement_status === 'completed') {
                        cy.log(`Skip settlement status: ${settlement_status}.`);
                        return;
                    }
                    settlement.getSettlementCheckbox(x).click();
                    // Click the export button
                    settlement.getSettlementExportBtn().click();
                    cy.wait(1500);

                    // Wait for the button to change to "Download file"
                    settlement.getSettlementExportBtn().should('have.text', 'Download file')
                    .then((exportbutton) => {
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

                    cy.get('@ComputedTotalSettledAmount').then((ComputedTotalSettledAmount) => {
                        cy.get('@TotalSettledAmount').then((TotalSettledAmount) => {
                            // Wrap the values to ensure proper chaining and comparison
                            cy.wrap(ComputedTotalSettledAmount).should('equal', TotalSettledAmount);
                        });
                    });
                    
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementDetails, value: "PASSED" });

                    GetDateRange(currentRow, recordTime, cutoff).then(() => {
                        cy.get('@dateRange').then((dateRange) => {
                            cy.log(`The date range is: ${dateRange}`);
                            sideMenu.getTransactionModule().click();
                            sideMenu.getTransactionSubModule().click();
                            cy.wait(1500);
                            filterTransactions(merchant, 'getTransactionTypeDeposit', 'getTransactionUpayVendor', 'getTransactionGCashSolution', { timeout: 10000 });
                            //process date filter
                            transactions.getTransactionProcessDateFilter().click().type(dateRange, { timeout: 10000 });
                            //click ok
                            transactions.getTransactionProcessDateOk().click();
                        });
                    });                    

                    // Click the export button
                    transactions.getTransactionExportBtn().click();

                    // Wait for the button to change to "Download file"
                    transactions.getTransactionExportBtn().should('have.text', 'Download file').then(() => {
                        // Click the download button now that it is available
                        transactions.getTransactionExportBtn().click();
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
                    // Navigate to the transaction page
                    sideMenu.getAccountsModule().should('be.visible').click();
                    // search the merchant name
                    accounts.getAccountSearchFilter().type(merchant);
                    cy.wait(3500)
                    if (merchant === 'TECHSOLUTIONS (CY) GROUP LIMITED') {
                        // click account number
                        accounts.getAccountAccountNumberData2ndRow().click()
                    }else{
                        // click account number
                        accounts.getAccountAccountNumberData().click()
                    }
                    // click sitolment tab
                    accountDetails.getAccountDetailsSettlementTab().click();
                    settlement.getSettlementSolutionMenu().contains('QRPH').click();

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

function GetDateRange (index, recordTime, cutoff) {
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

        let settlement_record_date = '20' + record_year + '/' + record_month + '/' + record_day;

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

            let dateRange = settlement_record_date + ' ~ ' + settlement_cutoff_date;

            //settlement date
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementDate, value: settlement_record_date });
            //settlement cutoff
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.settlementCutoff, value: settlement_cutoff_date });

            // Wrap the final dateRange to make it accessible for later Cypress commands
            cy.log('end of the GetDateRange')
            cy.wrap(dateRange).as('dateRange');
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