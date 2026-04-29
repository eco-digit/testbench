package de.ecodigit.yusuf.artefact.application;

import static de.ecodigit.yusuf.artefact.infrastructure.MinioRepository.AV_FOLDER;
import static de.ecodigit.yusuf.artefact.infrastructure.MinioRepository.AV_FOLDER_PREFIX;

import de.ecodigit.yusuf.artefact.application.dtos.*;
import de.ecodigit.yusuf.artefact.application.exceptions.ArtefactNotFoundException;
import de.ecodigit.yusuf.artefact.application.exceptions.MinioSaveArtefactException;
import de.ecodigit.yusuf.artefact.domain.*;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactEntity;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactEntityMapper;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.artefact.infrastructure.MinioRepository;
import de.ecodigit.yusuf.config.MinioInitializer;
import de.ecodigit.yusuf.context.application.exceptions.ContextNotFoundException;
import de.ecodigit.yusuf.context.infrastructure.ContextEntity;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.measurement.application.exceptions.MeasurementNotFoundException;
import de.ecodigit.yusuf.measurement.domain.DataSource;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntity;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Clock;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ArtefactService {

  private final ArtefactRepository artefactRepository;
  private final ContextRepository contextRepository;
  private final MeasurementRepository measurementRepository;
  private final MinioRepository minioRepository;
  private final ArtefactEntityMapper artefactEntityMapper;
  private final Clock clock;

  @Transactional(readOnly = true)
  public List<ArtefactWithLastMeasurementDto> getArtefactsWithLastMeasurement(
      UUID contextId, Optional<ArtefactType> fileType) {
    List<ArtefactEntity> entities =
        fileType
            .map(type -> artefactRepository.findByContextIdAndArtefactType(contextId, type))
            .orElseGet(() -> artefactRepository.findByContextId(contextId));

    return entities.stream().map(this::mapArtefactWithLastMeasurement).toList();
  }

  @Transactional(readOnly = true)
  public ArtefactDTO getArtefact(UUID artefactId) {
    return artefactEntityMapper.entityToDomainDTO(
        artefactRepository
            .findById(artefactId)
            .orElseThrow(() -> new ArtefactNotFoundException(artefactId)));
  }

  private ArtefactWithLastMeasurementDto mapArtefactWithLastMeasurement(ArtefactEntity artefact) {
    Optional<MeasurementEntity> lastMeasurementOptional =
        measurementRepository.findFirstByArtefactIdOrderByLastUpdatedDesc(artefact.getId());

    MeasurementDto lastMeasurementDto =
        lastMeasurementOptional.map(this::toMeasurementDto).orElse(null);

    return new ArtefactWithLastMeasurementDto(
        artefact.getId(),
        artefact.getOriginalFileName(),
        artefact.getCustomFileName(),
        artefact.getMimeType(),
        artefact.getArtefactType(),
        artefact.getDescription(),
        artefact.getCreationTime(),
        artefact.isDefaultFile(),
        lastMeasurementDto);
  }

  private MeasurementDto toMeasurementDto(MeasurementEntity m) {
    return new MeasurementDto(
        m.getId(),
        m.getName(),
        m.getLastUpdated(),
        m.getArtefact().getId(),
        m.getArtefact().getContext().getApplication().getId(),
        m.getMeasurementState(),
        m.getTrigger(),
        m.getEcodigitScore(),
        m.getAdp(),
        m.getCed(),
        m.getGwp(),
        m.getTox(),
        m.getWater(),
        m.getWeee());
  }

  @Transactional
  public UUID saveFileZipFile(SaveFileMetadataDto metadataDTO, MultipartFile file) {
    ContextEntity contextEntity =
        contextRepository
            .findById(metadataDTO.contextId())
            .orElseThrow(() -> new ContextNotFoundException(metadataDTO.contextId()));

    // Only one AV for each Application can be a defaultFile
    if (metadataDTO.defaultFile()) {
      artefactRepository
          .findByContextApplicationIdAndDefaultFile(metadataDTO.contextId(), true)
          .forEach(
              fileEntity -> {
                fileEntity.setDefaultFile(false);
                artefactRepository.save(fileEntity);
              });
    }

    ArtefactEntity artefactEntity =
        ArtefactEntity.builder()
            .originalFileName(file.getOriginalFilename())
            .context(contextEntity)
            .customFileName(metadataDTO.customFileName())
            .artefactType(metadataDTO.artefactType())
            .defaultFile(metadataDTO.defaultFile())
            .mimeType(file.getContentType())
            .description(metadataDTO.description())
            .creationTime(clock.instant())
            .dataSource(DataSource.DIRECTUPLOAD)
            .build();
    UUID fileId = artefactRepository.save(artefactEntity).getId();

    // minIO_DB - we only use zip-upload & applicationVariants at the moment
    saveApplicationVariantZipFile(artefactEntity.getId(), file);
    return fileId;
  }

  @Transactional(readOnly = true)
  public byte[] getResultsZip(UUID measurementId) {
    MeasurementEntity measurementEntity =
        measurementRepository
            .findById(measurementId)
            .orElseThrow(() -> new MeasurementNotFoundException(measurementId));
    UUID applicationVariantId = measurementEntity.getArtefact().getId();
    return minioRepository.getMeasurementResultsZip(applicationVariantId, measurementId);
  }

  private void saveApplicationVariantZipFile(UUID applicationVariantId, MultipartFile file) {
    try (InputStream inputStream = file.getInputStream();
        ZipInputStream zis = new ZipInputStream(inputStream)) {

      ZipEntry zipEntry;
      while ((zipEntry = zis.getNextEntry()) != null) {
        if (!zipEntry.isDirectory()) {
          String folder = AV_FOLDER_PREFIX + applicationVariantId + "/" + AV_FOLDER + "/";
          Path originalPath = Paths.get(zipEntry.getName());
          String filePath =
              Paths.get(zipEntry.getName())
                  .subpath(1, originalPath.getNameCount())
                  .toString()
                  .replace('\\', '/');

          minioRepository.saveSingleZipFileObject(
              MinioInitializer.APPLICATION_VARIANTS_BUCKET, folder + filePath, zis);
        }
      }
    } catch (IOException e) {
      throw new MinioSaveArtefactException(
          "Failed to create ZipInputStream from artefact: " + e.getMessage());
    }
  }

  @Transactional
  public void deleteArtefact(UUID artefactId) {
    ArtefactEntity artefact =
        artefactRepository
            .findById(artefactId)
            .orElseThrow(() -> new ArtefactNotFoundException(artefactId));

    String folderToDelete =
        MinioRepository.AV_FOLDER_PREFIX + artefact.getId() + "/" + MinioRepository.AV_FOLDER + "/";

    minioRepository.deleteFolder(MinioInitializer.APPLICATION_VARIANTS_BUCKET, folderToDelete);

    artefactRepository.delete(artefact);
  }
}
