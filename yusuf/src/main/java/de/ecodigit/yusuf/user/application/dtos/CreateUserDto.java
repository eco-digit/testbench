package de.ecodigit.yusuf.user.application.dtos;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class CreateUserDto {
  String username;
  String firstName;
  String lastName;
  String email;
  Map<String, List<String>> attributes = new HashMap<>();
  List<String> requiredActions = new ArrayList<>();
  boolean emailVerified;
  boolean enabled;
  List<Map<String, String>> credentials;
}
