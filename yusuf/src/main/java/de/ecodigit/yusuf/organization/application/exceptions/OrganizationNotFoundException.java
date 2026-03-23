package de.ecodigit.yusuf.organization.application.exceptions;

public class OrganizationNotFoundException extends RuntimeException {
  public OrganizationNotFoundException(String message) {
    super(message);
  }
}
