class LoginPageTest {
    getEmailField() {
        return cy.get("#emailAddress", {timeout: 10000});
    }
    getPasswordField() {
        return cy.get("#password", {timeout: 10000});
    }
    getSubmitButton() {
        return cy.get(".rs-btn", {timeout: 10000});
    }
}

module.exports = LoginPageTest;