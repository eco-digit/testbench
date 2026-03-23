package de.ecodigit.yusuf.user.application.dtos;

import lombok.Builder;

@Builder
public class GetTokenDto {
  String clientId;
  String clientSecret;
  String grantType;
}
