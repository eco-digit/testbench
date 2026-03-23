package de.ecodigit.yusuf.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandlerImpl;
import org.springframework.security.web.access.channel.ChannelProcessingFilter;
import org.springframework.security.web.authentication.Http403ForbiddenEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableRetry
@Profile({"dev", "prod", "local"})
public class SecurityConfig {
  @Value("${frontend.base-url}")
  private String frontendBaseUrl;

  @Value("${swagger.ui.uri}")
  private String swaggerUiUri;

  @Value("${api.docs.uri}")
  private String apiDocsUri;

  @Value("${api.base.auth.login}")
  private String apiBaseAuthLogin;

  @Value("${api.base.auth.logout}")
  private String apiBaseAuthLogout;

  @Value("${api.base.auth.user}")
  private String apiBaseAuthUser;

  @Value("${app.base.extern}")
  private String apiBaseExtern;

  @Value("${app.base.extern.secret}")
  private String externSecretKey;

  @Value("${keycloak.login-url}")
  private String keycloakLoginUrl;

  @Value("${keycloak.external.url}")
  private String keycloakBaseUrl;

  @Value("${keycloak.logout-uri}")
  private String keycloakLogoutUri;

  @Value("${frontend.sessioncookie.name}")
  private String frontendSessionCookieName;

  @Bean
  @Order(1)
  public SecurityFilterChain securityFilterChainExtern(HttpSecurity http) throws Exception {
    http.securityMatcher(apiBaseExtern)
        .addFilterBefore(new JwtFilter(externSecretKey), ChannelProcessingFilter.class)
        .csrf(AbstractHttpConfigurer::disable);
    return http.build();
  }

  @Bean
  @Order(2)
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(AbstractHttpConfigurer::disable)
        .securityMatcher("/**")
        .authorizeHttpRequests(
            authz ->
                authz
                    .requestMatchers(swaggerUiUri, apiDocsUri, apiBaseAuthLogin, apiBaseAuthUser)
                    .permitAll()
                    .anyRequest()
                    .permitAll())
        .oauth2Login(
            oauth2 -> oauth2.loginPage(keycloakLoginUrl).defaultSuccessUrl(frontendBaseUrl, true))
        .logout(
            logout ->
                logout
                    .logoutUrl(apiBaseAuthLogout)
                    .logoutSuccessHandler(keycloakLogoutSuccessHandler())
                    .invalidateHttpSession(true)
                    .deleteCookies(frontendSessionCookieName))
        .sessionManagement(session -> session.sessionFixation().migrateSession())
        .exceptionHandling(
            exceptions ->
                exceptions
                    .authenticationEntryPoint(new Http403ForbiddenEntryPoint())
                    .accessDeniedHandler(new AccessDeniedHandlerImpl()));
    return http.build();
  }

  @Bean
  public LogoutSuccessHandler keycloakLogoutSuccessHandler() {
    return (HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication) -> {
      if (authentication instanceof OAuth2AuthenticationToken oauthToken
          && oauthToken.getPrincipal() instanceof OidcUser oidcUser) {
        // Extract the principal and cast to OidcUser to access the ID Token
        String idToken = oidcUser.getIdToken().getTokenValue();

        // Keycloak logout URL with id_token_hint and post_logout_redirect_uri
        String keycloakLogoutUrl =
            keycloakBaseUrl
                + keycloakLogoutUri
                + "?post_logout_redirect_uri="
                + frontendBaseUrl
                + "&id_token_hint="
                + idToken;

        response.sendRedirect(keycloakLogoutUrl);
        return;
      }

      // Fallback redirect if no OAuth2AuthenticationToken or OidcUser is present
      response.sendRedirect(frontendBaseUrl);
    };
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of(frontendBaseUrl, keycloakBaseUrl));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
