package com.trackwheel.backend.repository;

import com.trackwheel.backend.entity.VehicleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VehicleRecordRepository extends JpaRepository<VehicleRecord, Long> {
    
    Optional<VehicleRecord> findByToken(String token);
    
    List<VehicleRecord> findByStatus(VehicleRecord.Status status);
    
    @Query("SELECT v FROM VehicleRecord v WHERE v.regNo LIKE %:query% OR v.token LIKE %:query%")
    List<VehicleRecord> searchByLicenseOrToken(@Param("query") String query);
    
    @Query("SELECT v FROM VehicleRecord v WHERE v.phone LIKE %:last4")
    List<VehicleRecord> searchByPhoneLast4(@Param("last4") String last4);
    
    Optional<VehicleRecord> findFirstByPhoneOrderByInTimeDesc(String phone);
    
    @Query("SELECT v FROM VehicleRecord v WHERE DATE(v.outTime) = DATE(:date)")
    List<VehicleRecord> findHistoryByDate(@Param("date") LocalDateTime date);
    
    @Query("SELECT v FROM VehicleRecord v WHERE v.status = 'COMPLETED' AND v.outTime >= :shiftStart")
    List<VehicleRecord> findCompletedSince(@Param("shiftStart") LocalDateTime shiftStart);
}
