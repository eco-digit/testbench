package de.ecodigit.yusuf.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MinioInitializer {

  public static final String APPLICATION_VARIANTS_BUCKET = "applicationvariants";

  private final MinioClient minioClient;

  @Autowired
  public MinioInitializer(MinioClient minioClient) {
    this.minioClient = minioClient;
  }

  @PostConstruct
  public void init() {
    // Aktuell benötigen wir nur ein Bucket
    createBucketIfNotExists(APPLICATION_VARIANTS_BUCKET);
  }

  private void createBucketIfNotExists(String bucketName) {
    try {
      boolean found =
          minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
      if (!found) {
        minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        log.info("Created bucket: {}", bucketName);
      } else {
        log.info("Bucket {} already exists.", bucketName);
      }
    } catch (MinioException | IOException | NoSuchAlgorithmException | InvalidKeyException e) {
      log.error("Error occurred: {}", e.getMessage());
    }
  }
}
