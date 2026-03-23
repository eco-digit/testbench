package de.ecodigit.yusuf.application.application.exceptions;

public class ApplicationException extends RuntimeException {

  public ApplicationException(String message) {
    super(message);
  }

  public ApplicationException(String message, Throwable e) {
    super(message, e);
  }
}
