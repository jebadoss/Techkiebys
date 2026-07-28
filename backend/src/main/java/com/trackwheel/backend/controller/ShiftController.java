package com.trackwheel.backend.controller;

import com.trackwheel.backend.dto.CloseShiftRequest;
import com.trackwheel.backend.entity.Shift;
import com.trackwheel.backend.service.ShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shift")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping("/summary")
    public ResponseEntity<Shift> getSummary() {
        return ResponseEntity.ok(shiftService.getSummary());
    }

    @PostMapping("/close")
    public ResponseEntity<Shift> closeShift(@RequestBody CloseShiftRequest request) {
        return ResponseEntity.ok(shiftService.closeShift(request.getCountedCash()));
    }
}
