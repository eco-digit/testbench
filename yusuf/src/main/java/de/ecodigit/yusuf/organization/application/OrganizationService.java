package de.ecodigit.yusuf.organization.application;

import de.ecodigit.yusuf.organization.application.dtos.OrganizationDto;
import de.ecodigit.yusuf.organization.application.dtos.OrganizationMapper;
import de.ecodigit.yusuf.organization.infrastructure.OrganizationRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrganizationService {
  private final OrganizationRepository organizationRepository;
  private final OrganizationMapper organizationMapper = new OrganizationMapper();

  public void createOrganization(OrganizationDto organizationDto) {
    organizationRepository.save(organizationMapper.toEntity(organizationDto));
  }

  public void updateOrganization(OrganizationDto organizationDto) {
    organizationRepository.save(organizationMapper.toEntity(organizationDto));
  }

  public void deleteOrganization(UUID organizationId) {
    organizationRepository.deleteById(organizationId);
  }
}
