package com.trackwheel.backend.service;

import com.trackwheel.backend.entity.Shift;
import com.trackwheel.backend.entity.VehicleRecord;
import com.trackwheel.backend.repository.ShiftRepository;
import com.trackwheel.backend.repository.VehicleRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftRepository shiftRepository;
    private final VehicleRecordRepository vehicleRecordRepository;

    public Shift getActiveShift() {
        return shiftRepository.findByStatus(Shift.Status.OPEN)
                .orElseGet(() -> {
                    Shift newShift = new Shift();
                    newShift.setStartTime(LocalDateTime.now());
                    newShift.setStatus(Shift.Status.OPEN);
                    return shiftRepository.save(newShift);
                });
    }

    public Shift getSummary() {
        Shift currentShift = getActiveShift();
        
        List<VehicleRecord> completedSinceStart = vehicleRecordRepository.findCompletedSince(currentShift.getStartTime());
        
        double expected = completedSinceStart.stream()
                .mapToDouble(v -> v.getFee() != null ? v.getFee() : 0.0)
                .sum();
                
        currentShift.setExpected(expected);
        return shiftRepository.save(currentShift);
    }

    public Shift closeShift(Double countedCash) {
        Shift currentShift = getSummary();
        
        currentShift.setEndTime(LocalDateTime.now());
        currentShift.setCountedCash(countedCash);
        currentShift.setDiff(countedCash - currentShift.getExpected());
        currentShift.setStatus(Shift.Status.CLOSED);
        
        shiftRepository.save(currentShift);
        
        // Open a new shift
        Shift newShift = new Shift();
        newShift.setStartTime(LocalDateTime.now());
        newShift.setStatus(Shift.Status.OPEN);
        shiftRepository.save(newShift);
        
        return currentShift;
    }
}
