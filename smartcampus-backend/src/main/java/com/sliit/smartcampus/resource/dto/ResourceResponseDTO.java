package com.sliit.smartcampus.resource.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.entity.ResourceType;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponseDTO {

    private UUID id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private List<String> amenities;
    private String imageUrl;
    private List<String> tags;
    private boolean archived;
    private String qrCode;
    private String availabilityWindows;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
