package org.recordapi.repository;

import org.recordapi.model.Record;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecordRepository extends JpaRepository<Record, Long> {
    // 必要に応じてカスタムクエリを追加できます
    boolean existsByName(String name);
}