package com.sliit.smartcampus.user.dto;

import com.sliit.smartcampus.user.NotifPrefs;
import com.sliit.smartcampus.user.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private UUID id;
    private String email;
    private String name;
    private String pictureUrl;
    private Role role;
    private String provider;
    private NotifPrefs notifPrefs;
    private LocalDateTime createdAt;
}