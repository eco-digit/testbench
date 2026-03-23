package de.ecodigit.yusuf.user.application.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class KeyCloakTokenResponseDto {
  @JsonProperty("access_token")
  String accessToken;
}
