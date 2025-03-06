import { common } from "../../../fixtures/prd/common";
import filterTransactions from '../../../functions/balanceChecker/filterTransactions';
import LoginPageTest from '../../../pages/loginPage';
import SidebarMenuTest from '../../../pages/sidebarMenu';
import TransactionPageTest from '../../../pages/transactionPage';
import TopupBalancePageTest from '../../../pages/topupBalancePage';
import TopupHistoryPageTest from '../../../pages/topupHistory';

// npx cypress run --spec "cypress/e2e/BalanceChecker/Topup/*"
// npx cypress run --spec "cypress/e2e/BalanceChecker/Topup/PESONET_BALANCE.cy.js"
// npx cypress open

// Cypress.config('defaultCommandTimeout', 10000);
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

const exportFilePath = 'cypress/downloads/instapay_withdrawal.csv';
const topupFilePath = 'cypress/downloads/top-ups.csv';

const filpath = 'cypress/e2e/Reports/BalanceChecker/Topup_Balance.xlsx'; //changed to excel path file
const sheetName = "PESONET TOPUP BALANCE";
// const merchantlist = ["RIVALRY LIMITED"];
// const merchantlist = ["FooBar Prod"];
const merchantlist = [
    // "EXNESS LIMITED",
    "RIVALRY LIMITED"
    // "TECHSOLUTIONS (CY) GROUP LIMITED",
    // "TECHOPTIONS (CY) GROUP LIMITED",
    // "ZOTA TECHNOLOGY PTE LTD"
];
const Merchants = merchantlist.slice();

const login = new LoginPageTest();
const sideMenu = new SidebarMenuTest();
const transactions = new TransactionPageTest();
const topupBalance = new TopupBalancePageTest();
const topupHistory = new TopupHistoryPageTest();

describe('Check all merchant Top-Up Balance', () => {
    Merchants.forEach((merchant, index) => {
        it(`Top-up balance: ${merchant}`, () => {
            // Get the length of the merchantlist
            const length = merchantlist.length;
            // Print the current index and the total number of merchants
            cy.log(`Merchant ${index + 2} of ${length}: ${merchant}`);
            
            cy.task('deleteFile', exportFilePath).then((message) => {
                cy.log(message);
            });
            cy.task('deleteFile', topupFilePath).then((message) => {
                cy.log(message);
            });
            
            // Login
            cy.visit(common.login_url);
            login.getEmailField().type(common.adminEmail);
            login.getPasswordField().type(common.adminPass);
            login.getSubmitButton().click();

            // Navigate to transaction page
            sideMenu.getTransactionModule().click();
            sideMenu.getTransactionSubModule().click();

            // Filter transactions
            filterTransactions(merchant, 'getTransactionTypeWithdrawal', 'getTransactionAllBankVendor', 'getTransactionPesonetSolution', { timeout: 15000 });
            
            // Click the export button
            transactions.getTransactionExportBtn().click();
            // Wait for the button to change to "Download file"
            transactions.getTransactionExportBtn().should('have.text', 'Download file').then(() => {
                // Click the download button now that it is available
                transactions.getTransactionExportBtn().click();
            });

            // rename the downloaded file
            cy.task('findAndRenameLatestFile', {
                directoryPath: 'cypress/downloads',
                newFileName: `instapay_withdrawal.csv`
            }).then((message) => {  
                cy.log(message)
            })
            // compute all net amount with status 'completed' and 'pending'
            cy.task('parseCSV', exportFilePath).then((data) => {
                const completedOrPendingWithdrawals = data.filter(row => {
                    return row.Status && 
                    (row.Status.trim().toLowerCase() === 'completed' || row.Status.trim().toLowerCase() === 'pending');
                });
                const totalNetAmount = completedOrPendingWithdrawals.reduce((sum, row) => {
                    const netAmount = parseFloat(row['Net Amount'].replace(/PHP |,/g, '')); // Use 'Net Amount'
                    return sum + netAmount;
                }, 0);
                // Format the total amount
                const withdrawalExported = formatCurrency(totalNetAmount);
                cy.log(`Total Withdrawal Amount for merchant ${merchant}: PHP ${withdrawalExported}`);
                GoToTopupBalance(index, merchant, withdrawalExported)
            });
        });
    });
});

const GoToTopupBalance = (index, merchantName, withdrawalExported) => {
    const sheetCells = {
        withdrawalExported: `E${index+2}`,
        withdrawalDisplayed: `F${index+2}`,
        availableBalanceDisplayed: `G${index+2}`,
        availableBalanceComputed: `H${index+2}`,
        status: `I${index+2}`,
        remarks: `J${index+2}`
    };

    // Go to Topup page
    sideMenu.getTopupBalanceModule().click({ timeout: 10000 });
    cy.wait(4500);

    // click instapay
    topupBalance.getTopupBalancePesonet().click({ timeout: 10000 });
    cy.wait(4500);

    // search merchant name
    topupBalance.getTopupBalanceSearch().type(merchantName, { timeout: 10000 });
    cy.wait(4500);
    // get the total topup amount
    topupBalance.getTopupBalanceTotalTopupAmount2ndRow().invoke('text').then((totaltopup) => {
        topupBalance.getTopupBalanceTotalWithdrawalAmount2ndRow().invoke('text').then((totalwithdrawal) => {
            topupBalance.getTopupBalanceAvailableBalance2ndRow().invoke('text').then((availablebalance) => {
                cy.wait(4500)
                // Log values before parsing to check their correctness
                cy.log("Total Topup: " + totaltopup);
                cy.log("Total Withdrawal: " + totalwithdrawal);
                cy.log("Available Balance: " + availablebalance);

                // Clean the strings before parsing
                const cleanText = (text) => parseFloat(text.replace(/PHP |,/g, '').trim());

                // Ensure that we're properly cleaning the text
                const trimmedTopup = cleanText(totaltopup);
                const trimmedWithdrawal = cleanText(totalwithdrawal);
                const trimmedAvailableBalance = cleanText(availablebalance);
                
                const computedAvailable = trimmedTopup - trimmedWithdrawal;

                // Format and log results
                const totalTopupDisplayed = formatCurrency(trimmedTopup);
                const withdrawalDisplayed = formatCurrency(trimmedWithdrawal);
                const availableBalanceDisplayed = formatCurrency(trimmedAvailableBalance);
                const availableBalanceComputed = formatCurrency(computedAvailable);

                cy.log("The displayed balance: " + availableBalanceDisplayed);
                cy.log("The computed balance: " + availableBalanceComputed);

                try {
                    //expect withdrawalExported = withdrawalDisplayed
                    expect(withdrawalExported).to.eq(withdrawalDisplayed);
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "PASSED" });
                } catch (error) {
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "FAILED" });
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, remarks: `The exported amount ${withdrawalExported} and displayed amount ${withdrawalDisplayed} are not equal.` });
                }
    
                try {
                    //expect availableBalanceDisplayed = availableBalanceComputed
                    expect(availableBalanceDisplayed).to.eq(availableBalanceComputed);
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "PASSED" });
                } catch (error) {
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "FAILED" });
                    cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `The displayed amount ${availableBalanceDisplayed} and computed amount ${availableBalanceComputed} are not equal.` });
                }
    
                //total withdrawal exported
                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.withdrawalExported, value: withdrawalExported });
                //total withdrawal displayed
                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.withdrawalDisplayed, value: withdrawalDisplayed });
                //available balance displayed
                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.availableBalanceDisplayed, value: availableBalanceDisplayed });
                //available balance computed
                cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.availableBalanceComputed, value: availableBalanceComputed });
    
                // Call GoToTopupHistory and pass the necessary variables
                GoToTopupHistory(index, merchantName, totalTopupDisplayed);
            });
        });
    });
};

const GoToTopupHistory = (index, merchantName, totalTopupDisplayed) => {
    const sheetCells = {
        accountNumber: `A${index+2}`,
        merchantName: `B${index+2}`,
        totalTopupExported: `C${index+2}`,
        totalTopupDisplayed: `D${index+2}`,
        status: `I${index+2}`,
        remarks: `J${index+2}`
    };

    // click topup history
    topupHistory.getTopupHistory().click({ timeout: 10000 });
    // check if the page loaded
    topupHistory.getTopupHistoryRow().should('exist', { timeout: 50000 });

    // Merchant mapping
    const merchantMap = {
        'EXNESS LIMITED': 'AC2374426306',
        'RIVALRY LIMITED': 'AC2473062452',
        'TECHSOLUTIONS (CY) GROUP LIMITED': 'AC2347670819',
        'TECHOPTIONS (CY) GROUP LIMITED': 'AC2346446835',
        'ZOTA TECHNOLOGY PTE LTD': 'AC2313592098'
    };

    // Type merchant name in search filter
    const account = merchantMap[merchantName]; // Ensure accountNumber is set here
    if (account) {
        topupHistory.getTopupHistorySearch().type(`${account}{enter}`, { timeout: 10000 });
        cy.wait(4500);
        //click solution dropdown
        topupHistory.getSolutionDropdown().click();
        //select instapay solution
        topupHistory.getSolutionPesonet().click();
        //account number
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.accountNumber, value: account });
        //merchant name
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: merchantName });
    }

    // check if the page loaded after the filter
    topupHistory.getTopupHistoryRow().should('have.text', merchantName, { timeout: 35000 });
    // click export button
    topupHistory.getTopupHistoryExportBtn().click();
    // Wait for the button to change to "Download file"
    topupHistory.getTopupHistoryDownloadBtn().should('have.text', 'Download file').then(() => {
        // Click the download button now that it is available
        topupHistory.getTopupHistoryDownloadBtn().click();
    });

    // Compute all topup amount with status 'completed'
    cy.task('parseCSV', topupFilePath).then((data) => {
        const completedWithdrawals = data.filter(row => row.Status?.trim().toLowerCase() === 'completed');
        const totalTopupBalance = completedWithdrawals.reduce((sum, row) => {
            return sum + parseFloat(row['Top-up Amount'].replace(/PHP |,/g, ''));
        }, 0);
        cy.log(`Topup history total topup balance: ${totalTopupBalance}`)
        let finalComputed;
        if (merchantName == 'RIVALRY LIMITED'){
            finalComputed = totalTopupBalance - 481022.02    //rivalry pesonet topup
            // finalComputed = totalTopupBalance   //rivalry pesonet topup
            cy.log(`Rivalry PesoNet Topup: ${finalComputed}`)
        }else{
            // finalComputed = totalTopupBalance - trimmedPeso_Topup
            finalComputed = totalTopupBalance
        }
        const totalTopupExported = formatCurrency(finalComputed);
        try{
            expect(totalTopupExported).to.eq(totalTopupDisplayed);
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "PASSED" });
        }catch (error){
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.status, value: "FAILED" });
            cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.remarks, value: `The displayed amount ${totalTopupExported} and computed amount ${totalTopupDisplayed} are not equal.` });
        }
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalTopupExported, value: totalTopupExported });
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.totalTopupDisplayed, value: totalTopupDisplayed });
    });
};