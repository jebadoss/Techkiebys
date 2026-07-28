package com.trackwheel.backend.service;

import com.trackwheel.backend.entity.VehicleRecord;
import com.trackwheel.backend.repository.VehicleRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRecordRepository repository;

    public VehicleRecord checkIn(VehicleRecord record) {
        record.setToken(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        record.setInTime(LocalDateTime.now());
        record.setStatus(VehicleRecord.Status.ACTIVE);
        return repository.save(record);
    }

    public VehicleRecord checkOut(String token) {
        VehicleRecord record = repository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with token: " + token));

        if (record.getStatus() == VehicleRecord.Status.COMPLETED) {
            throw new RuntimeException("Vehicle already checked out");
        }

        record.setOutTime(LocalDateTime.now());
        record.setStatus(VehicleRecord.Status.COMPLETED);
        
        // Simple fare calculation: $5 base + $2 per hour
        long hours = Duration.between(record.getInTime(), record.getOutTime()).toHours();
        double fee = 5.0 + (hours * 2.0);
        record.setFee(fee);

        return repository.save(record);
    }

    public List<VehicleRecord> getActiveVehicles() {
        return repository.findByStatus(VehicleRecord.Status.ACTIVE);
    }

    public List<VehicleRecord> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getActiveVehicles();
        }
        return repository.searchByLicenseOrToken(query);
    }

    public List<VehicleRecord> searchByPhone(String last4) {
        return repository.searchByPhoneLast4(last4);
    }

    public VehicleRecord getFrequentParker(String phone) {
        return repository.findFirstByPhoneOrderByInTimeDesc(phone).orElse(null);
    }

    public List<VehicleRecord> getHistory(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            dateStr = LocalDate.now().toString();
        }
        LocalDate date = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
        return repository.findHistoryByDate(date.atStartOfDay());
    }
}
