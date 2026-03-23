package de.ecodigit.yusuf.user.ui;

import de.ecodigit.yusuf.user.application.UserManagementService;
import de.ecodigit.yusuf.user.application.dtos.CreateUserDto;
import de.ecodigit.yusuf.user.application.dtos.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("usermanagement")
@RequiredArgsConstructor
public class UserManagementController {
  private final UserManagementService userManagementService;

  @Operation(summary = "Get list of all user")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "User list was sent."),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/users")
  public ResponseEntity<List<UserDto>> getListOfAllUsers() {
    return ResponseEntity.ok(userManagementService.getUsers());
  }

  @Operation(summary = "Get user by id")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "User was sent."),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @GetMapping("/user")
  public ResponseEntity<UserDto> getUserById(@RequestParam("id") String id) {
    UserDto user = userManagementService.getUserById(id);
    return ResponseEntity.ok(user);
  }

  @Operation(summary = "Create user")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "User was created."),
        @ApiResponse(responseCode = "204", description = "User email already exist."),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PostMapping("/user")
  public void createNewUser(@RequestBody CreateUserDto createUserDto) {
    userManagementService.createUser(createUserDto);
  }

  @Operation(summary = "Delete user")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "User was deleted."),
        @ApiResponse(responseCode = "204", description = "User not found."),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @DeleteMapping("/user")
  public void deleteUser(@RequestParam("id") String id) {
    userManagementService.deleteUser(id);
  }

  @Operation(summary = "Update user config")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "User was updated."),
        @ApiResponse(responseCode = "204", description = "User not found."),
        @ApiResponse(responseCode = "400", description = "Bad Request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  @PutMapping("/user")
  public void updateUser(@RequestBody UserDto userDto) {
    userManagementService.updateUser(userDto);
  }
}
