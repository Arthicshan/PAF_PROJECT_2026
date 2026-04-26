package com.sliit.smartcampus.resource.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.sliit.smartcampus.resource.dto.*;
import com.sliit.smartcampus.resource.entity.Resource;
import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.entity.ResourceType;
import com.sliit.smartcampus.resource.exception.DuplicateResourceException;
import com.sliit.smartcampus.resource.exception.ResourceNotFoundException;
import com.sliit.smartcampus.resource.mapper.ResourceMapper;
import com.sliit.smartcampus.resource.repository.ResourceRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

    public ResourceResponseDTO createResource(ResourceRequestDTO dto) {
        resourceRepository.findByNameAndLocationAndArchivedFalse(dto.getName(), dto.getLocation())
                .ifPresent(r -> {
                    throw new DuplicateResourceException("Resource already exists at this location");
                });

        Resource resource = resourceMapper.toEntity(dto);
        resource.setArchived(false);
        resource.setQrCode(UUID.randomUUID().toString());

        return resourceMapper.toDTO(resourceRepository.save(resource));
    }

    public List<ResourceResponseDTO> getAllResources() {
        return resourceRepository.findByArchivedFalse().stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Resource getResourceEntityById(UUID id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
    }

    public ResourceResponseDTO getResourceById(UUID id) {
        return resourceMapper.toDTO(getResourceEntityById(id));
    }

    public List<ResourceResponseDTO> getResourcesByType(ResourceType type) {
        return resourceRepository.findByTypeAndArchivedFalse(type).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDTO> getResourcesByStatus(ResourceStatus status) {
        return resourceRepository.findByStatusAndArchivedFalse(status).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ResourceResponseDTO> searchByLocation(String location) {
        return resourceRepository.findByLocationContainingIgnoreCaseAndArchivedFalse(location).stream()
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Page<ResourceResponseDTO> getAllResourcesPaged(Pageable pageable) {
        return resourceRepository.findAllByArchivedFalse(pageable)
                .map(resourceMapper::toDTO);
    }

    public Page<ResourceResponseDTO> filterResources(ResourceType type, ResourceStatus status, Pageable pageable) {
        return resourceRepository.findByTypeAndStatusAndArchivedFalse(type, status, pageable)
                .map(resourceMapper::toDTO);
    }

    public ResourceResponseDTO updateResource(UUID id, ResourceRequestDTO dto) {
        Resource existingResource = getResourceEntityById(id);
        existingResource.setName(dto.getName());
        existingResource.setType(dto.getType());
        existingResource.setCapacity(dto.getCapacity());
        existingResource.setLocation(dto.getLocation());
        existingResource.setStatus(dto.getStatus());
        existingResource.setAmenities(dto.getAmenities());
        existingResource.setImageUrl(dto.getImageUrl());
        existingResource.setTags(dto.getTags());
        existingResource.setAvailabilityWindows(dto.getAvailabilityWindows());
        return resourceMapper.toDTO(resourceRepository.save(existingResource));
    }

    public void deleteResource(UUID id) {
        Resource existingResource = getResourceEntityById(id);
        existingResource.setArchived(true);
        resourceRepository.save(existingResource);
    }

    public ResourceResponseDTO updateStatus(UUID id, UpdateStatusDTO dto) {
        Resource existingResource = getResourceEntityById(id);
        existingResource.setStatus(dto.getStatus());
        return resourceMapper.toDTO(resourceRepository.save(existingResource));
    }

    public ReviewResponseDTO addReview(UUID id, ReviewRequestDTO dto) {
        getResourceEntityById(id);
        return ReviewResponseDTO.builder()
                .id(UUID.randomUUID())
                .resourceId(id)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public AvailabilityDTO checkAvailability(UUID id, LocalDateTime from, LocalDateTime to) {
        getResourceEntityById(id);
        return AvailabilityDTO.builder()
                .from(from)
                .to(to)
                .available(true)
                .build();
    }

    public List<ResourceResponseDTO> searchResources(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        String lq = query.toLowerCase();
        return resourceRepository.findByArchivedFalse().stream()
                .filter(r ->
                        (r.getName() != null && r.getName().toLowerCase().contains(lq)) ||
                        (r.getLocation() != null && r.getLocation().toLowerCase().contains(lq)) ||
                        (r.getAmenities() != null && r.getAmenities().toString().toLowerCase().contains(lq)) ||
                        (r.getTags() != null && r.getTags().toString().toLowerCase().contains(lq))
                )
                .map(resourceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public AnalyticsDTO getResourceAnalytics(UUID id) {
        Resource resource = getResourceEntityById(id);

        long totalSameType  = resourceRepository.findByTypeAndArchivedFalse(resource.getType()).size();
        long activeSameType = resourceRepository.findByTypeAndArchivedFalse(resource.getType())
                .stream()
                .filter(r -> r.getStatus() != null && r.getStatus().name().equals("ACTIVE"))
                .count();
        double utilizationRate = totalSameType > 0
                ? Math.round((activeSameType * 100.0 / totalSameType) * 10.0) / 10.0
                : 0.0;

        String status = resource.getStatus() != null ? resource.getStatus().name() : "Unknown";
        return AnalyticsDTO.builder()
                .totalBookings(0)
                .utilizationRate(utilizationRate)
                .aiInsight("Resource '" + resource.getName() + "' is currently " + status
                        + " with a type utilization rate of " + utilizationRate + "%.")
                .prediction("Demand is expected to remain consistent based on current resource availability.")
                .build();
    }
}
