package com.trackwheel.backend.repository;

import com.trackwheel.backend.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    
    Optional<Shift> findTopByOrderByIdDesc();
    
    Optional<Shift> findByStatus(Shift.Status status);
}
