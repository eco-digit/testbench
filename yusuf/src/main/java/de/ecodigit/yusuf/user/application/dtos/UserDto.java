package de.ecodigit.yusuf.user.application.dtos;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class UserDto {
  String id;
  String username;
  String firstName;
  String lastName;
  String email;
  boolean emailVerified;
  Map<String, List<String>> attributes = new HashMap<>();
}
