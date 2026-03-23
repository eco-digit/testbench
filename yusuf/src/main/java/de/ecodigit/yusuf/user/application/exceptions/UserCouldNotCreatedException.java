package de.ecodigit.yusuf.user.application.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class UserCouldNotCreatedException extends RuntimeException {
  private final HttpStatus httpStatus;

  public UserCouldNotCreatedException(String message, HttpStatus httpStatus) {
    super(message);
    this.httpStatus = httpStatus;
  }
}
