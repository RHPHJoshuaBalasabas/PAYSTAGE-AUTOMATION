const { defineConfig } = require("cypress");
const { google } = require('googleapis');
const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const Papa = require('papaparse');

module.exports = defineConfig({
  downloadsFolder: 'cypress/downloads',
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        log(message) {
          console.log('Transaction Number: '+ message +'\t\tPASSED');
          return null; // Cypress tasks must return a value
        },

        async parseCSV(filePath) {
          return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, fileContent) => {
              if (err) {
                return reject(err);
              }
              Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
              });
            });
          });
        },

        async parseXLSX({exportFilePath, sheetIndex}) {
          // Read the xlsx file
          const workbook = XLSX.readFile(exportFilePath);
          
          // Check if the specified sheet exists
          if (workbook.SheetNames.length <= sheetIndex) {
            throw new Error(`The sheet at index ${sheetIndex} does not exist in the provided XLSX file.`);
          }

          // Get the sheet name dynamically based on the provided index
          const sheetName = workbook.SheetNames[sheetIndex];
          const sheet = workbook.Sheets[sheetName];

          // Convert the sheet into JSON format
          const data = XLSX.utils.sheet_to_json(sheet);

          return data; // Return the data to the test
        },

        async deleteFile(filePath) {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return "Deleted file: ${filePath}";
          } else {
            return "File not found: ${filePath}";
          }
        },

        async findAndRenameLatestFile({ directoryPath, newFileName }) {
          // Read the directory
          const files = fs.readdirSync(directoryPath).map(file => ({
            name: file,
            time: fs.statSync(path.join(directoryPath, file)).mtime.getTime()
          }));

          // Find the latest file
          const latestFile = files.reduce((prev, current) => (prev.time > current.time) ? prev : current);

          // Rename the latest file
          const oldPath = path.join(directoryPath, latestFile.name);
          const newPath = path.join(directoryPath, newFileName);
          fs.renameSync(oldPath, newPath);

          return "Renamed ${latestFile.name} to ${newFileName}";
        },

        async writeToGoogleSheet({ sheetId, cell, value }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            await sheets.spreadsheets.values.update({
              spreadsheetId: sheetId,
              range: cell,
              valueInputOption: 'RAW',
              resource: {
                values: [[value]]
              }
            });
            return null;
          } catch (error) {
            console.error('Error writing to Google Sheets:', error);
            return { error: error.toString() };
          }
        },

        async readFromGoogleSheet({ sheetId, cell }) {
          try {
            const keyFilePath = path.resolve('cypress/support/paystage-automation-tool-8c403695dde6.json');
            const auth = new google.auth.GoogleAuth({
              keyFile: keyFilePath,
              scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
            });
            const sheets = google.sheets({ version: 'v4', auth });
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId: sheetId,
              range: cell
            });
            return response.data.values[0][0];
          } catch (error) {
            console.error('Error reading from Google Sheets:', error);
            return { error: error.toString() };
          }
        },

        async writeToExcel({ filePath, sheetName, cell, value }) {
          const fullPath = path.resolve(config.projectRoot, filePath);
          if (!filePath || typeof filePath !== 'string') {
            console.error(`Invalid filePath provided: ${filePath}`);
            return { error: 'Invalid filePath provided' };
          }
          try {
            const workbook = XLSX.readFile(fullPath);
            const sheet = workbook.Sheets[sheetName];
            if (!sheet) {
              throw new Error(`Sheet "${sheetName}" not found`);
            }
            sheet[cell] = { v: value, t: 's' };
            XLSX.writeFile(workbook, fullPath);
          } catch (error) {
            console.error(`Error writing to Excel: ${error.message}`);
            return { error: error.message };
          }
          return null;
        }
      });
      //return config;
    },
    downloadsFolder: 'cypress/downloads', // Directory for downloaded files
  },
  projectId: "99db26",
  viewportWidth: 2320,
  viewportHeight: 1580,

  experimentalMemoryManagement: true, // Add this line
  numTestsKeptInMemory: 0 // Optional, adjust as needed
});
