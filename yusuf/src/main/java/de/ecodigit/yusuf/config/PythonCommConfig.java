package de.ecodigit.yusuf.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestClient;

@ConditionalOnProperty(
    value = "arthur.service.enabled",
    havingValue = "true",
    matchIfMissing = true)
@Configuration
@Slf4j
public class PythonCommConfig {

  @Bean
  public ObjectMapper arthurObjectMapper() {
    return new ObjectMapper().setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
  }

  /**
   * Apply transformation to snake case for all requests.
   *
   * @param objectMapper of custom type.
   * @param arthurBaseUrl base url of arthur app
   * @return WebClient to send requests to arthur.
   */
  @Bean
  @Qualifier("arthurWebClient") public RestClient arthurWebClient(
      @Qualifier("arthurObjectMapper") ObjectMapper objectMapper,
      @Value("${arthur.service.url}") String arthurBaseUrl) {
    log.atInfo().log(objectMapper.getPropertyNamingStrategy().toString());
    return RestClient.builder()
        .baseUrl(arthurBaseUrl)
        .messageConverters(
            httpMessageConverters ->
                httpMessageConverters.add(new MappingJackson2HttpMessageConverter(objectMapper)))
        .build();
  }
}
