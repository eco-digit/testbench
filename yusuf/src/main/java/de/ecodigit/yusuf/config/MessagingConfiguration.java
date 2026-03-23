package de.ecodigit.yusuf.config;

import java.net.http.HttpClient;
import javax.sql.DataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.integration.jdbc.lock.DefaultLockRepository;
import org.springframework.integration.jdbc.lock.JdbcLockRegistry;
import org.springframework.integration.jdbc.lock.LockRepository;
import org.springframework.integration.jdbc.metadata.JdbcMetadataStore;
import org.springframework.integration.metadata.MetadataStore;
import org.springframework.integration.support.leader.LockRegistryLeaderInitiator;
import org.springframework.integration.support.locks.LockRegistry;

@Configuration
@EnableIntegration
public class MessagingConfiguration {

  @Bean
  public MetadataStore metadataStore(DataSource dataSource) {
    return new JdbcMetadataStore(dataSource);
  }

  @Bean
  public LockRegistryLeaderInitiator leaderInitiator(LockRegistry locks) {
    return new LockRegistryLeaderInitiator(locks);
  }

  @Bean
  public LockRepository lockRepository(DataSource dataSource) {
    var lockRepository = new DefaultLockRepository(dataSource);
    lockRepository.setTimeToLive(5000);
    return lockRepository;
  }

  @Bean
  public LockRegistry lockRegistry(LockRepository lockRepository) {
    return new JdbcLockRegistry(lockRepository);
  }

  @Bean
  public HttpClient arthurHttpClient() {
    return HttpClient.newHttpClient();
  }
}
