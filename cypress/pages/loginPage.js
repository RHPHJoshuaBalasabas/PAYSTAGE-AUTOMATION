class LoginPageTest {
    getEmailField() {
        return cy.get("#emailAddress");
    }
    getPasswordField() {
        return cy.get("#password");
    }
    getSubmitButton() {
        return cy.get(".rs-btn");
    }
}

module.exports = LoginPageTest;