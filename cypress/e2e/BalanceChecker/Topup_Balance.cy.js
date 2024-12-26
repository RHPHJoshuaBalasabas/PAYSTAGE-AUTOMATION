import { common } from "../../fixtures/prd/common";
import { filterTransactions } from './filterTransactions';
import { loginpage_locators, sidebarmenu_locators} from "../../fixtures/prd/locators";
// npx cypress run --spec "cypress/e2e/BalanceChecker/*"
// npx cypress run --spec "cypress/e2e/BalanceChecker/Topup_Balance.cy.js"
// npx cypress open


Cypress.config('defaultCommandTimeout', 10000);
Cypress.on('uncaught:exception', (err) => {
    // Handle specific errors gracefully
    if (err.message.includes('canceled')) {
    return false;
    }
    return true;
});

// Helper function for formatting currency
function formatCurrency(amount) {
    return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const exportFilePath = 'cypress/downloads/instapay_withdrawal.csv';
const topupFilePath = 'cypress/downloads/top-ups.csv';

const filpath = 'cypress/e2e/Reports/BalanceChecker/Topup_Balance.xlsx'; //changed to excel path file
const sheetName = "TOPUP BALANCE";
const merchantlist = ["EXNESS LIMITED", "RIVALRY LIMITED", "TECHSOLUTIONS (CY) GROUP LIMITED", "TECHOPTIONS (CY) GROUP LIMITED", "ZOTA TECHNOLOGY PTE LTD"]
const Merchants = merchantlist.slice();

describe('Check all merchant Top-Up Balance', () => {
    Merchants.forEach((merchant, index) => {
        it(`Top-up balance: ${merchant}`, () => {
            // Get the length of the merchantlist
            const length = merchantlist.length;
            // Print the current index and the total number of merchants
            console.log(`Merchant ${index + 2} of ${length}: ${merchant}`);
            
            cy.task('deleteFile', exportFilePath).then((message) => {
                cy.log(message);
            });
            cy.task('deleteFile', topupFilePath).then((message) => {
                cy.log(message);
            });
            
            // Login
            cy.visit(common.login_url);
            cy.get(loginpage_locators.email_field).type(common.adminEmail);
            cy.get(loginpage_locators.pass_field).type(common.adminPass);
            cy.get(loginpage_locators.submit_button).click();

            // Navigate to transaction page
            cy.get(sidebarmenu_locators.transaction_module, { timeout: 4500 }).click();
            cy.get(sidebarmenu_locators.transaction_submodule).click();

            // Filter transactions
            filterTransactions(merchant, 'type_withdrawal', 'vendor_allbank', 'solution_instapay', { timeout: 5500 });
            
            // Click the export button
            cy.get('.space-x-3 > .rs-btn > div', { timeout: 3500, interval: 1200 }).click();
            // Wait for the button to change to "Download file"
            cy.get('.space-x-3 > .rs-btn > div', { timeout: 50000 }).should('have.text', 'Download file').then(() => {
                // Click the download button now that it is available
                cy.get('.space-x-3 > .rs-btn > div').click();
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
    cy.get('[href="https://portal.paystage.net/top-ups"]').click({ timeout: 10000 });
    cy.wait(3000);
    // click instapay
    cy.get('.flex-row-reverse > :nth-child(6)').click({ timeout: 10000 });
    cy.wait(1500);
    // search merchant name
    cy.get('.rs-form-control > .rs-input').type(merchantName, { timeout: 10000 });
    cy.wait(3500);
    // get the total topup amount
    cy.get('[aria-rowindex="3"] > .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content').invoke('text').then((totaltopup) => {
        cy.get('[aria-rowindex="3"] > .rs-table-cell-group > [aria-colindex="6"] > .rs-table-cell-content').invoke('text').then((totalwithdrawal) => {
            cy.get('[aria-rowindex="3"] > .rs-table-cell-group > .rs-table-cell-last > .rs-table-cell-content').invoke('text').then((availablebalance) => {
                // click pesonet
                cy.get('.flex-row-reverse > :nth-child(7)').click({ timeout: 10000 });
                cy.wait(1500);
                // get the pesonet topup
                cy.get('[aria-rowindex="3"] > .rs-table-cell-group > [aria-colindex="5"] > .rs-table-cell-content').invoke('text').then((pesonet_totaltopup) => {
                    const trimmedTopup = parseFloat(totaltopup.replace(/PHP |,/g, ''));
                    const trimmedWithdrawal = parseFloat(totalwithdrawal.replace(/PHP |,/g, ''));
                    const trimmedAvailableBalance = parseFloat(availablebalance.replace(/PHP |,/g, ''));
                    const trimmedPeso_Topup = parseFloat(pesonet_totaltopup.replace(/PHP |,/g, ''));
                    const computedAvailable = trimmedTopup - trimmedWithdrawal;

                    const totalTopupDisplayed = formatCurrency(trimmedTopup);
                    const withdrawalDisplayed = formatCurrency(trimmedWithdrawal);
                    const availableBalanceDisplayed = formatCurrency(trimmedAvailableBalance);
                    const availableBalanceComputed = formatCurrency(computedAvailable);
                    
                    cy.log("The displayed balance" + availableBalanceDisplayed);
                    cy.log("The computed balance" + availableBalanceComputed);

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
                    GoToTopupHistory(index, merchantName, totalTopupDisplayed, trimmedPeso_Topup);
                });
                
            });
        });
    });
};

const GoToTopupHistory = (index, merchantName, totalTopupDisplayed, trimmedPeso_Topup) => {
    const sheetCells = {
        accountNumber: `A${index+2}`,
        merchantName: `B${index+2}`,
        totalTopupExported: `C${index+2}`,
        totalTopupDisplayed: `D${index+2}`,
        status: `I${index+2}`,
        remarks: `J${index+2}`
    };

    // click topup history
    cy.get('.mb-3 > :nth-child(2)').click({ timeout: 10000 });
    cy.wait(3000);

    // check if the page loaded
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content').should('exist', { timeout: 50000 });

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
        cy.get('.rs-input-group > .rs-input').type(`${account}{enter}`, { timeout: 10000 });
        //account number
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.accountNumber, value: account });
        //merchant name
        cy.task('writeToExcel', { filePath: filpath, sheetName: sheetName, cell: sheetCells.merchantName, value: merchantName });
    }

    // check if the page loaded after the filter
    cy.get('[aria-rowindex="2"] > .rs-table-cell-group > [aria-colindex="3"] > .rs-table-cell-content').should('have.text', merchantName, { timeout: 35000 });
    // click export button
    cy.get('.flex > :nth-child(2) > div', { timeout: 3500, interval: 1200 }).click();
    // Wait for the button to change to "Download file"
    cy.get('a.rs-btn > div', { timeout: 50000 }).should('have.text', 'Download file').then(() => {
        // Click the download button now that it is available
        cy.get('a.rs-btn > div').click();
    });

    // Compute all topup amount with status 'completed'
    cy.task('parseCSV', topupFilePath).then((data) => {
        const completedWithdrawals = data.filter(row => row.Status?.trim().toLowerCase() === 'completed');
        const totalTopupBalance = completedWithdrawals.reduce((sum, row) => {
            return sum + parseFloat(row['Top-up Amount'].replace(/PHP |,/g, ''));
        }, 0);
        const finalComputed = totalTopupBalance - trimmedPeso_Topup
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
