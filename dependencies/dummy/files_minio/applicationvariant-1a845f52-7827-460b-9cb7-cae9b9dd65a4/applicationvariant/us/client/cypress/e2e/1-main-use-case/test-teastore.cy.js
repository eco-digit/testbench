/// <reference types="cypress" />

describe('test teastore', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('buy tea', () => {
    // Log in
    cy.get('#navbar > .nav > :nth-child(1) > a').click()
    cy.get('.btn').click()
    
    // Buy black tea
    cy.contains('Black Tea').click()
    cy.get(':nth-child(1) > .thumbnail > form > .btn').click()
    cy.get('[name="proceedtoCheckout"]').click()
    cy.get('.btn').click()

    // Check alert
    cy.get('.alert').should('contain', 'Your order is confirmed!')
  })

})


