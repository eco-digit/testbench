package de.ecodigit.yusuf.organization.ui;

import de.ecodigit.yusuf.organization.application.OrganizationService;
import de.ecodigit.yusuf.organization.application.dtos.OrganizationDto;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("organization")
@RequiredArgsConstructor
public class OrganizationController {

  // The Keycloak-Service to get the orgId of the current request is not yet implemented.
  public static final UUID TEMPORARY_GLOBAL_ORG_ID =
      UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

  private final OrganizationService organizationService;

  @PostMapping("/create")
  public void createOrganization(@RequestBody OrganizationDto organizationDto) {
    organizationService.createOrganization(organizationDto);
  }

  @PutMapping("")
  public void updateOrganization(@RequestBody OrganizationDto organizationDto) {
    organizationService.updateOrganization(organizationDto);
  }

  @DeleteMapping("/{organizationId}")
  public void deleteOrganization(@PathVariable("organizationId") UUID organizationId) {
    organizationService.deleteOrganization(organizationId);
  }
}
