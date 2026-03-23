package de.ecodigit.yusuf.user.infrastructure;

import de.ecodigit.yusuf.user.application.dtos.*;
import de.ecodigit.yusuf.user.application.exceptions.*;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

@Service
@RequiredArgsConstructor
public class KeyCloakAdapter {
  private final KeycloakRestClient keycloakRestClient;
  private static final String HEADER_AUTHORIZATION = "Authorization";
  private static final String TOKEN_PREFIX = "Bearer ";
  private static final String AUTHENTICATION_FAILED =
      "Getting users failed because of not Unauthorized ";

  @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
  private String keycloakClientId;

  @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
  private String keycloakClientSecret;

  @Value("${keycloak.token-uri}")
  private String keycloakTokenUri;

  @Value("${keycloak.users-uri}")
  private String keycloakUsersUri;

  public List<UserDto> getUsers() {
    String tokenResponseDto = getBearerToken();
    return keycloakRestClient
        .getClient()
        .get()
        .uri(keycloakUsersUri)
        .accept(MediaType.APPLICATION_JSON)
        .header(HEADER_AUTHORIZATION, TOKEN_PREFIX + tokenResponseDto)
        .retrieve()
        .onStatus(
            HttpStatusCode::is4xxClientError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                throw new UserListCouldNotBeFetchedException(
                    AUTHENTICATION_FAILED, HttpStatus.UNAUTHORIZED);
              }
            })
        .onStatus(
            HttpStatusCode::is5xxServerError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.INTERNAL_SERVER_ERROR)) {
                throw new UserListCouldNotBeFetchedException(
                    "User List could not be fetched", HttpStatus.NOT_FOUND);
              }
            })
        .body(new ParameterizedTypeReference<>() {});
  }

  public UserDto getUserById(String userId) {
    String token = getBearerToken();
    return keycloakRestClient
        .getClient() // 🔥 Ensured `.getClient()` is included
        .get()
        .uri(keycloakUsersUri + "/" + userId)
        .accept(MediaType.APPLICATION_JSON)
        .header(HEADER_AUTHORIZATION, TOKEN_PREFIX + token)
        .retrieve()
        .onStatus(
            HttpStatusCode::is4xxClientError,
            (request, response) -> {
              throw new UserListCouldNotBeFetchedException("User not found", HttpStatus.NOT_FOUND);
            })
        .onStatus(
            HttpStatusCode::is5xxServerError,
            (request, response) -> {
              throw new UserListCouldNotBeFetchedException(
                  "Server error while fetching user", HttpStatus.INTERNAL_SERVER_ERROR);
            })
        .body(UserDto.class);
  }

  public void createUser(CreateUserDto createUserDto) {
    String token = getBearerToken();
    keycloakRestClient
        .getClient()
        .post()
        .uri(keycloakUsersUri)
        .contentType(MediaType.APPLICATION_JSON)
        .header(HEADER_AUTHORIZATION, TOKEN_PREFIX + token)
        .body(createUserDto)
        .retrieve()
        .onStatus(
            HttpStatusCode::is4xxClientError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                throw new UserCouldNotCreatedException(
                    AUTHENTICATION_FAILED, HttpStatus.UNAUTHORIZED);
              }
              if (response.getStatusCode().isSameCodeAs(HttpStatus.CONFLICT)) {
                throw new UserCouldNotCreatedException(
                    "User Email already exist", HttpStatus.CONFLICT);
              }
            })
        .onStatus(
            HttpStatusCode::is5xxServerError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.INTERNAL_SERVER_ERROR)) {
                throw new UserCouldNotCreatedException(
                    "User could not be created", HttpStatus.NOT_FOUND);
              }
            })
        .body(UserDto.class);
  }

  public void deleteUser(String id) {
    String token = getBearerToken();
    keycloakRestClient
        .getClient()
        .delete()
        .uri(keycloakUsersUri + "/" + id)
        .header(HEADER_AUTHORIZATION, TOKEN_PREFIX + token)
        .retrieve()
        .onStatus(
            HttpStatusCode::is4xxClientError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                throw new UserCouldNotDeletedException(
                    HttpStatus.UNAUTHORIZED, "Getting users failed because of not Unauthorized");
              }
              if (response.getStatusCode().isSameCodeAs(HttpStatus.NOT_FOUND)) {
                throw new UserCouldNotDeletedException(HttpStatus.NOT_FOUND, "User doesnt exist");
              }
            })
        .onStatus(
            HttpStatusCode::is5xxServerError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.INTERNAL_SERVER_ERROR)) {
                throw new UserCouldNotDeletedException(
                    HttpStatus.NOT_FOUND, "User could not be deleted");
              }
            })
        .body(Void.class);
  }

  public void updateUser(UserDto updateUserDto) {
    String token = getBearerToken();
    keycloakRestClient
        .getClient()
        .put()
        .uri(keycloakUsersUri + "/" + updateUserDto.getId())
        .contentType(MediaType.APPLICATION_JSON)
        .header(HEADER_AUTHORIZATION, TOKEN_PREFIX + token)
        .body(updateUserDto)
        .retrieve()
        .onStatus(
            HttpStatusCode::is4xxClientError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.UNAUTHORIZED)) {
                throw new UserCouldNotUpdatedException(
                    "Getting users failed because of not Unauthorized", HttpStatus.UNAUTHORIZED);
              }
              if (response.getStatusCode().isSameCodeAs(HttpStatus.NOT_FOUND)) {
                throw new UserCouldNotUpdatedException("User doesnt exist", HttpStatus.NOT_FOUND);
              }
            })
        .onStatus(
            HttpStatusCode::is5xxServerError,
            (request, response) -> {
              if (response.getStatusCode().isSameCodeAs(HttpStatus.INTERNAL_SERVER_ERROR)) {
                throw new UserCouldNotUpdatedException(
                    "User List could not be updated", HttpStatus.NOT_FOUND);
              }
            })
        .body(UserDto.class);
  }

  private String getBearerToken() {
    MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
    body.add("client_id", keycloakClientId);
    body.add("client_secret", keycloakClientSecret);
    body.add("grant_type", "client_credentials");

    return Objects.requireNonNull(
            keycloakRestClient
                .getClient()
                .post()
                .uri(keycloakTokenUri)
                .body(body)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .retrieve()
                .body(KeyCloakTokenResponseDto.class))
        .getAccessToken();
  }
}
