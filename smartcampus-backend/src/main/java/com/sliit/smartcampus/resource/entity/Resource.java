package com.sliit.smartcampus.resource.entity;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Document(collection = "resources")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @Builder.Default
    private UUID id = UUID.randomUUID();

    @NotBlank(message = "Name is required")
    private String name;

    private ResourceType type;

    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private ResourceStatus status;

    private List<String> amenities;

    private String imageUrl;

    private List<String> tags;

    @Builder.Default
    private boolean archived = false;

    private String qrCode;

    private String availabilityWindows;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
