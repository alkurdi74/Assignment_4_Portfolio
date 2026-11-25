describe('portfolio application end-to-end', () => {
  const adminEmail = Cypress.env('ADMIN_EMAIL') || 'admin@example.test';
  const adminPassword = Cypress.env('ADMIN_PASSWORD') || 'Assignment4TestPassword!';

  function signInAsAdmin() {
    cy.visit('/account');
    cy.get('#account-email').type(adminEmail);
    cy.get('#account-password').type(adminPassword);
    cy.contains('button', 'Sign in').click();
    cy.contains('Role:').should('contain.text', 'admin');
  }

  it('submits the contact form and persists it in MongoDB', () => {
    const marker = `e2e-${Date.now()}`;
    cy.visit('/contact');
    cy.get('#first-name').type('Cypress');
    cy.get('#last-name').type('Demo');
    cy.get('#phone').type('555-0100');
    cy.get('#email').type(`${marker}@example.test`);
    cy.get('#message').type(`Assignment 4 contact check ${marker}`);
    cy.contains('button', 'Submit message').click();
    cy.location('pathname').should('eq', '/');
    cy.contains('Home').should('exist');

    cy.request('POST', '/auth/signin', { email: adminEmail, password: adminPassword })
      .then(({ body }) => {
        expect(body.token).to.be.a('string');
        return cy.request({
          url: '/api/contacts',
          headers: { Authorization: `Bearer ${body.token}` },
        });
      })
      .its('body')
      .should((records) => {
        expect(records.some((record) => record.email === `${marker}@example.test`)).to.eq(true);
      });
  });

  it('lets an administrator create, edit, and delete a project', () => {
    const title = `Assignment 4 E2E ${Date.now()}`;
    signInAsAdmin();
    cy.get('nav[aria-label="Main navigation"] a[href="/project"]').click();
    cy.contains('h1', 'My Projects');
    cy.contains('button', 'Add project').click();
    cy.contains('h2', 'Add project');
    cy.contains('label', 'title').find('input').type(title);
    cy.contains('label', 'firstname').find('input').type('Cypress');
    cy.contains('label', 'lastname').find('input').type('Admin');
    cy.contains('label', 'email').find('input').type('admin@example.test');
    cy.contains('label', 'completion').find('input').type('2026-11-24');
    cy.contains('label', 'description').find('input').type('Assignment 4 end-to-end CRUD evidence');
    cy.contains('button', 'Create record').click();
    cy.contains('article h2', title).should('be.visible');

    cy.contains('article', title).contains('button', 'Edit').click();
    cy.contains('label', 'title').find('input').clear().type(`${title} updated`);
    cy.contains('button', 'Save changes').click();
    cy.contains('article h2', `${title} updated`).should('be.visible');

    cy.on('window:confirm', () => true);
    cy.contains('article', `${title} updated`).contains('button', 'Delete').click();
    cy.contains('article h2', `${title} updated`).should('not.exist');
  });

  it('allows a regular signed-in user to read but not edit portfolio records', () => {
    const userEmail = `reader-${Date.now()}@example.test`;
    cy.visit('/account');
    cy.contains('button', 'Create an account').click();
    cy.get('#account-name').type('Portfolio Reader');
    cy.get('#account-email').type(userEmail);
    cy.get('#account-password').type('ReaderPassword!234');
    cy.contains('button', 'Sign up and sign in').click();
    cy.contains('Role:').should('contain.text', 'user');
    cy.get('nav[aria-label="Main navigation"] a[href="/project"]').click();
    cy.contains('h1', 'My Projects');
    cy.contains('button', 'Add project').should('not.exist');
    cy.get('.cards button').should('not.exist');
  });
});
