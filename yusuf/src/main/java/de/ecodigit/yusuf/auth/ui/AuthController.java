package de.ecodigit.yusuf.auth.ui;

import de.ecodigit.yusuf.auth.application.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @GetMapping("/login")
  public void login(HttpServletResponse response) throws IOException {
    response.sendRedirect(authService.getLoginRedirectUrl());
  }

  @GetMapping("/logout")
  public void logout(HttpServletResponse response) throws IOException {
    response.sendRedirect(authService.getLogoutRedirectUrl());
  }

  @GetMapping("/user")
  public ResponseEntity<Map<String, String>> checkAuthentication(
      OAuth2AuthenticationToken authentication) {
    Map<String, String> response = new HashMap<>();

    if (authentication != null && authentication.isAuthenticated()) {
      response.put("status", "authenticated");
    } else {
      response.put("status", "unauthenticated");
    }

    return ResponseEntity.ok(response);
  }

  @GetMapping("/session")
  public String checkSessionStatus(HttpServletRequest request) {
    HttpSession session = request.getSession(false);

    if (session != null) {
      return "Session exists with ID: " + session.getId();
    } else {
      return "No active session found";
    }
  }
}
