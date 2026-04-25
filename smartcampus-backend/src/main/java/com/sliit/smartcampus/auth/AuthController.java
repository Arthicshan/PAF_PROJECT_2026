package com.sliit.smartcampus.auth;

import com.sliit.smartcampus.auth.dto.ApiRegisterRequest;
import com.sliit.smartcampus.auth.dto.AuthResponse;
import com.sliit.smartcampus.auth.dto.LoginRequest;
import com.sliit.smartcampus.resource.dto.ApiResponse;
import com.sliit.smartcampus.user.NotifPrefs;
import com.sliit.smartcampus.user.Role;
import com.sliit.smartcampus.user.User;
import com.sliit.smartcampus.user.UserRepository;
import com.sliit.smartcampus.user.UserService;
import com.sliit.smartcampus.user.dto.UserResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.setup-key:change-me}")
    private String adminSetupKey;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody ApiRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = userRepository.save(
                User.builder()
                        .email(request.getEmail())
                        .name(request.getName())
                        .pictureUrl(request.getPictureUrl())
                        .passwordHash(passwordEncoder.encode(request.getPassword()))
                        .role(Role.USER)
                        .provider("LOCAL_API")
                        .notifPrefs(new NotifPrefs())
                        .build()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("User registered successfully", toAuthResponse(user))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return ResponseEntity.ok(
                ApiResponse.success("Login successful", toAuthResponse(user))
        );
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AuthResponse>> updateRoleForSetup(
            @PathVariable UUID id,
            @RequestParam Role role,
            @RequestHeader("X-Admin-Setup-Key") String setupKey) {

        if (!adminSetupKey.equals(setupKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid admin setup key");
        }

        UserResponseDTO updatedUser = userService.updateRole(id, role);
        String token = jwtUtil.generateToken(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getRole().name()
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Role updated successfully",
                        AuthResponse.builder()
                                .token(token)
                                .user(updatedUser)
                                .build()
                )
        );
    }

    private AuthResponse toAuthResponse(User user) {
        UserResponseDTO userResponse = userService.toDTO(user);
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name()))
                .user(userResponse)
                .build();
    }
}
