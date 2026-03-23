package de.ecodigit.yusuf.organization.application.dtos;

import de.ecodigit.yusuf.organization.infrastructure.OrganizationEntity;

public class OrganizationMapper {

  public OrganizationEntity toEntity(OrganizationDto organizationDto) {

    return new OrganizationEntity(
        organizationDto.organizationId(),
        organizationDto.name(),
        organizationDto.address(),
        organizationDto.industry());
  }
}
