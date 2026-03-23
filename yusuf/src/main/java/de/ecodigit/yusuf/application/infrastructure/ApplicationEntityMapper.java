package de.ecodigit.yusuf.application.infrastructure;

import de.ecodigit.yusuf.application.application.dtos.ApplicationDashboardDto;
import de.ecodigit.yusuf.application.domain.ApplicationDto;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ApplicationEntityMapper {
  ApplicationEntityMapper INSTANCE = Mappers.getMapper(ApplicationEntityMapper.class);

  ApplicationDto applicationToApplicationDTO(ApplicationEntity applicationEntity);

  @Mapping(target = "id", source = "measurementEntity.artefact.context.application.id")
  @Mapping(target = "name", source = "measurementEntity.artefact.context.application.name")
  @Mapping(target = "lastMeasurementScore", source = "measurementEntity.ecodigitScore")
  ApplicationDashboardDto toApplicationDashboardDto(MeasurementEntity measurementEntity);

  @Mapping(target = "lastMeasurementScore", ignore = true)
  ApplicationDashboardDto toApplicationDashboardDto(ApplicationEntity applicationEntity);
}
