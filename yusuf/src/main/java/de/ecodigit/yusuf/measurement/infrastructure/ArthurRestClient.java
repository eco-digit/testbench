package de.ecodigit.yusuf.measurement.infrastructure;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class ArthurRestClient {

  private final RestClient restClient;

  @Autowired
  public ArthurRestClient(@Value("${arthur.service.url}") String arthurBaseUrl) {
    this.restClient = RestClient.builder().baseUrl(arthurBaseUrl).build();
  }

  public RestClient getClient() {
    return restClient;
  }
}
