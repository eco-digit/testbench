package de.ecodigit.yusuf.measurement.infrastructure;

import de.ecodigit.yusuf.measurement.application.dtos.MeasurementContextDto;
import de.ecodigit.yusuf.measurement.application.dtos.MeasurementOverviewDto;
import de.ecodigit.yusuf.measurement.domain.MeasurementDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface MeasurementEntityMapper {
  MeasurementEntityMapper INSTANCE = Mappers.getMapper(MeasurementEntityMapper.class);

  @Mapping(source = "artefact.id", target = "artefactId")
  @Mapping(source = "artefact.context.application.id", target = "applicationId")
  MeasurementDto entityToDomainDto(MeasurementEntity measurementEntity);

  @Mapping(source = "artefact.customFileName", target = "applicationVariantName")
  MeasurementOverviewDto entityToOverviewDto(MeasurementEntity measurementEntity);

  @Mapping(source = "artefact.context.id", target = "contextId")
  @Mapping(source = "creationDate", target = "created")
  @Mapping(source = "artefact.originalFileName", target = "artefactName")
  MeasurementContextDto entityToContextDto(MeasurementEntity measurementEntity);
}
