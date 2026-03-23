package de.ecodigit.yusuf.user.infrastructure;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class KeycloakRestClient {

  private final RestClient keycloakRestClient;

  @Autowired
  public KeycloakRestClient(@Value("${keycloak.external.url}") String keycloakBaseUrl) {
    this.keycloakRestClient = RestClient.builder().baseUrl(keycloakBaseUrl).build();
  }

  public RestClient getClient() {
    return keycloakRestClient;
  }
}
