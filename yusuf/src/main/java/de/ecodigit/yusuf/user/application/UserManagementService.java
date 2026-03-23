package de.ecodigit.yusuf.user.application;

import de.ecodigit.yusuf.organization.application.OrganizationService;
import de.ecodigit.yusuf.organization.application.dtos.OrganizationDto;
import de.ecodigit.yusuf.user.application.dtos.CreateUserDto;
import de.ecodigit.yusuf.user.application.dtos.UserDto;
import de.ecodigit.yusuf.user.infrastructure.KeyCloakAdapter;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserManagementService {

  private final KeyCloakAdapter keyCloakAdapter;
  private final OrganizationService organizationService;

  public List<UserDto> getUsers() {
    return keyCloakAdapter.getUsers();
  }

  public void createUser(CreateUserDto createUserDto) {
    List<String> organisations = createUserDto.getAttributes().get("organisations");
    Map<String, List<String>> attributes = createUserDto.getAttributes();
    // create user organisation
    organizationService.createOrganization(
        new OrganizationDto(null, createUserDto.getUsername() + " Organisations", "", ""));
    // Adding own organisation to CreateUserDto
    organisations.add(createUserDto.getUsername() + " Organisations");
    attributes.put("organisations", organisations);
    // Create user in keycloak
    keyCloakAdapter.createUser(createUserDto);
  }

  public void deleteUser(String id) {
    keyCloakAdapter.deleteUser(id);
  }

  public void updateUser(UserDto userDto) {
    keyCloakAdapter.updateUser(userDto);
  }

  public UserDto getUserById(String id) {
    return keyCloakAdapter.getUserById(id);
  }
}
