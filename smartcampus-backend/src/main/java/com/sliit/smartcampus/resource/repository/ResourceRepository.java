package com.sliit.smartcampus.resource.repository;

import com.sliit.smartcampus.resource.entity.Resource;
import com.sliit.smartcampus.resource.entity.ResourceStatus;
import com.sliit.smartcampus.resource.entity.ResourceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, UUID> {

    Optional<Resource> findByNameAndLocationAndArchivedFalse(String name, String location);

    List<Resource> findByArchivedFalse();

    List<Resource> findByTypeAndArchivedFalse(ResourceType type);

    List<Resource> findByStatusAndArchivedFalse(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCaseAndArchivedFalse(String location);

    Page<Resource> findAllByArchivedFalse(Pageable pageable);

    Page<Resource> findByTypeAndStatusAndArchivedFalse(ResourceType type, ResourceStatus status, Pageable pageable);
}
