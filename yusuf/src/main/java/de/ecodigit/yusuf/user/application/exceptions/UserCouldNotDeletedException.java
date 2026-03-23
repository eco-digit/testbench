package de.ecodigit.yusuf.user.application.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UserCouldNotDeletedException extends RuntimeException {
  private final HttpStatus httpStatus;

  public UserCouldNotDeletedException(HttpStatus httpStatus, String message) {
    super(message);
    this.httpStatus = httpStatus;
  }
}
