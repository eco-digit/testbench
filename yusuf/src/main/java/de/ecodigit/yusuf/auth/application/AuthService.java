package de.ecodigit.yusuf.auth.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

  @Value("${keycloak.authorization-redirect}")
  private String loginUrl;

  @Value("${keycloak.logout-url}")
  private String logoutUrl;

  public String getLoginRedirectUrl() {
    return loginUrl;
  }

  public String getLogoutRedirectUrl() {
    return logoutUrl;
  }
}
