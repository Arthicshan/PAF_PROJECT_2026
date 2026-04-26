package com.sliit.smartcampus.user;

import com.sliit.smartcampus.user.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        return toDTO(user);
    }

    @Transactional
    public UserResponseDTO updateRole(UUID id, Role newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setRole(newRole);
        return toDTO(userRepository.save(user));
    }

    // NEW — update notification preferences
    @Transactional
    public UserResponseDTO updatePreferences(UUID id, NotifPrefs prefs) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        user.setNotifPrefs(prefs);
        return toDTO(userRepository.save(user));
    }

    public UserResponseDTO toDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .pictureUrl(user.getPictureUrl())
                .role(user.getRole())
                .provider(user.getProvider())
                .notifPrefs(user.getNotifPrefs())  // ← added
                .createdAt(user.getCreatedAt())
                .build();
    }

    public List<UserResponseDTO> getTechnicians() {
        return userRepository.findByRole(Role.TECHNICIAN)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}