package de.ecodigit.yusuf.config;

import com.fasterxml.jackson.dataformat.yaml.YAMLMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class YamlConfig {

  @Bean(name = "yamlMapper")
  public YAMLMapper yamlMapper() {
    return new YAMLMapper();
  }
}
