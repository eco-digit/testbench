package de.ecodigit.yusuf.artefact.infrastructure;

import de.ecodigit.yusuf.artefact.application.exceptions.MinioGetArtefactException;
import de.ecodigit.yusuf.artefact.application.exceptions.MinioSaveArtefactException;
import de.ecodigit.yusuf.config.MinioInitializer;
import io.minio.*;
import io.minio.messages.Item;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MinioRepository {

  public static final String AV_FOLDER_PREFIX = "applicationvariant-";
  public static final String AV_FOLDER = "applicationvariant";
  private static final String M_FOLDER_PREFIX = "measurement-";
  private static final String M_RESULT_FOLDER = "results";
  private static final long PART_SIZE = 32 * (long) Math.pow(2, 20);
  private final MinioClient minioClient;

  public void saveSingleZipFileObject(String bucket, String objectName, ZipInputStream zis) {
    try {
      minioClient.putObject(
          PutObjectArgs.builder().bucket(bucket).object(objectName).stream(zis, -1, PART_SIZE)
              .build());
    } catch (Exception e) {
      throw new MinioSaveArtefactException("Failed to save artefact in Minio: " + e.getMessage());
    }
  }

  public byte[] getMeasurementResultsZip(UUID applicationVariantId, UUID measurementId) {
    String folderName =
        AV_FOLDER_PREFIX
            + applicationVariantId
            + "/"
            + M_FOLDER_PREFIX
            + measurementId
            + "/"
            + M_RESULT_FOLDER
            + "/";

    // Zip Ordner Vorbereitungen
    try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream)) {

      // Objektliste vom results Ordner erstellen
      Iterable<Result<Item>> results =
          minioClient.listObjects(
              ListObjectsArgs.builder()
                  .bucket(MinioInitializer.APPLICATION_VARIANTS_BUCKET)
                  .prefix(folderName) // Der Ordnerpfad
                  .build());

      // Objekte aus MinIO holen und in ZipOutputStream schreiben
      results.forEach(
          // Objektname holen
          itemResult -> {
            Item item;
            try {
              item = itemResult.get();
            } catch (Exception e) {
              throw new MinioGetArtefactException("Failed to get Item: " + e.getMessage());
            }
            String objectName = item.objectName();

            // Datei aus MinIO abrufen
            try (InputStream inputStream =
                minioClient.getObject(
                    GetObjectArgs.builder()
                        .bucket(MinioInitializer.APPLICATION_VARIANTS_BUCKET)
                        .object(objectName)
                        .build())) {

              // Datei zur ZIP hinzufügen
              zipOutputStream.putNextEntry(new ZipEntry(objectName.substring(folderName.length())));
              byte[] buffer = new byte[1024];
              while (inputStream.read(buffer) != -1) {
                zipOutputStream.write(buffer);
              }
              zipOutputStream.closeEntry();
            } catch (Exception e) {
              throw new MinioGetArtefactException(
                  "Failed to retrieve artefact from Minio: " + e.getMessage());
            }
          });
      zipOutputStream.close();
      return byteArrayOutputStream.toByteArray();
    } catch (Exception e) {
      throw new MinioGetArtefactException("Failed to create output streams " + e.getMessage());
    }
  }
}
