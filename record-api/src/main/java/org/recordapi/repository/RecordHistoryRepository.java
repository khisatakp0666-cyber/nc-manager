package org.recordapi.repository;

import org.recordapi.entity.RecordHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordHistoryRepository extends JpaRepository<RecordHistoryEntity, Long> {
}