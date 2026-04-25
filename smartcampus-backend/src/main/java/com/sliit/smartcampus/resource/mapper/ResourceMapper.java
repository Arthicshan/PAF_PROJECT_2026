package com.sliit.smartcampus.resource.mapper;

import org.springframework.stereotype.Component;
import com.sliit.smartcampus.resource.dto.ResourceRequestDTO;
import com.sliit.smartcampus.resource.dto.ResourceResponseDTO;
import com.sliit.smartcampus.resource.entity.Resource;

@Component
public class ResourceMapper {

    public Resource toEntity(ResourceRequestDTO dto) {
        if (dto == null) return null;

        return Resource.builder()
                .name(dto.getName())
                .type(dto.getType())
                .capacity(dto.getCapacity())
                .location(dto.getLocation())
                .status(dto.getStatus())
                .amenities(dto.getAmenities())
                .imageUrl(dto.getImageUrl())
                .tags(dto.getTags())
                .availabilityWindows(dto.getAvailabilityWindows())
                .build();
    }

    public ResourceResponseDTO toDTO(Resource entity) {
        if (entity == null) return null;

        return ResourceResponseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .type(entity.getType())
                .capacity(entity.getCapacity())
                .location(entity.getLocation())
                .status(entity.getStatus())
                .amenities(entity.getAmenities())
                .imageUrl(entity.getImageUrl())
                .tags(entity.getTags())
                .archived(entity.isArchived())
                .qrCode(entity.getQrCode())
                .availabilityWindows(entity.getAvailabilityWindows())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
