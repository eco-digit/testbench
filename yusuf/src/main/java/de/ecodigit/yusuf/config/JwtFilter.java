package de.ecodigit.yusuf.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.security.authentication.BadCredentialsException;

public class JwtFilter implements Filter {

  private final String internalApiKey;

  JwtFilter(String internalApiKey) {
    this.internalApiKey = internalApiKey;
  }

  @Override
  public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
      throws IOException, ServletException {
    HttpServletRequest httpServletRequest = (HttpServletRequest) request;

    String apiKey = httpServletRequest.getHeader("authorization");

    if (apiKey == null) {
      throw new BadCredentialsException("Missing authorization header");
    }

    if (!internalApiKey.equals(apiKey.substring(7))) {
      throw new BadCredentialsException("Token not valid");
    }

    chain.doFilter(request, response);
  }
}
