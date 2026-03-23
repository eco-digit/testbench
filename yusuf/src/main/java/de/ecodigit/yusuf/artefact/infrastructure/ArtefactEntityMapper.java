package de.ecodigit.yusuf.artefact.infrastructure;

import de.ecodigit.yusuf.artefact.domain.ArtefactDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ArtefactEntityMapper {

  ArtefactDTO entityToDomainDTO(ArtefactEntity artefactEntity);
}
