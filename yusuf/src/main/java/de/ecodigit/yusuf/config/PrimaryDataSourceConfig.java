package de.ecodigit.yusuf.config;

import java.util.HashMap;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

/** Config of Database from yusuf */
@Configuration
public class PrimaryDataSourceConfig {

  private static final String modelPackage = "de.ecodigit.yusuf";

  @Value("${spring.datasource.postgres.jdbcUrl}")
  private String jdbcUrl;

  @Value("${spring.datasource.postgres.username}")
  private String dbUsername;

  @Value("${spring.datasource.postgres.password}")
  private String dbPassword;

  @Value("${spring.flyway.locations}")
  private String flywayLocations;

  @Primary
  @Bean(name = "postgresDataSource")
  public DataSource postgresDataSource() {
    DriverManagerDataSource dataSource = new DriverManagerDataSource();
    dataSource.setUrl(jdbcUrl);
    dataSource.setUsername(dbUsername);
    dataSource.setPassword(dbPassword);

    return dataSource;
  }

  @Primary
  @Bean(name = "entityManagerFactory")
  public LocalContainerEntityManagerFactoryBean postgresEntityManagerFactory() {
    LocalContainerEntityManagerFactoryBean factoryBean =
        new LocalContainerEntityManagerFactoryBean();

    factoryBean.setDataSource(postgresDataSource());
    factoryBean.setPackagesToScan(modelPackage);

    factoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

    HashMap<String, Object> properties = new HashMap<>();
    properties.put("hibernate.hbm2ddl.auto", "none");
    factoryBean.setJpaPropertyMap(properties);

    return factoryBean;
  }

  @Primary
  @Bean(name = "transactionManager")
  public JpaTransactionManager postgresTransactionManager() {
    JpaTransactionManager transactionManager = new JpaTransactionManager();

    transactionManager.setEntityManagerFactory(postgresEntityManagerFactory().getObject());

    return transactionManager;
  }

  @Bean(initMethod = "migrate")
  public Flyway primaryFlyway(@Qualifier("postgresDataSource") DataSource dataSource) {
    return Flyway.configure()
        .dataSource(dataSource)
        .locations(flywayLocations)
        .baselineOnMigrate(true)
        .load();
  }
}
