package com.trackwheel.backend.controller;

import com.trackwheel.backend.entity.VehicleRecord;
import com.trackwheel.backend.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping("/check-in")
    public ResponseEntity<VehicleRecord> checkIn(@RequestBody VehicleRecord record) {
        return ResponseEntity.ok(vehicleService.checkIn(record));
    }

    @PostMapping("/check-out/{token}")
    public ResponseEntity<VehicleRecord> checkOut(@PathVariable(name = "token") String token) {
        return ResponseEntity.ok(vehicleService.checkOut(token));
    }

    @GetMapping("/active")
    public ResponseEntity<List<VehicleRecord>> getActiveVehicles() {
        return ResponseEntity.ok(vehicleService.getActiveVehicles());
    }

    @GetMapping("/search")
    public ResponseEntity<List<VehicleRecord>> search(@RequestParam(name = "q", required = false) String q) {
        return ResponseEntity.ok(vehicleService.search(q));
    }

    @GetMapping("/search-phone")
    public ResponseEntity<List<VehicleRecord>> searchByPhone(@RequestParam(name = "last4") String last4) {
        return ResponseEntity.ok(vehicleService.searchByPhone(last4));
    }

    @GetMapping("/frequent/{phone}")
    public ResponseEntity<VehicleRecord> getFrequentParker(@PathVariable(name = "phone") String phone) {
        VehicleRecord record = vehicleService.getFrequentParker(phone);
        if (record != null) {
            return ResponseEntity.ok(record);
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/history")
    public ResponseEntity<List<VehicleRecord>> getHistory(@RequestParam(name = "date", required = false) String date) {
        return ResponseEntity.ok(vehicleService.getHistory(date));
    }

    @GetMapping("/test-history")
    public ResponseEntity<List<VehicleRecord>> testHistory() {
        return ResponseEntity.ok(vehicleService.getHistory(null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        e.printStackTrace();
        return ResponseEntity.badRequest().body("ERROR: " + e.getClass().getName() + " - " + e.getMessage());
    }
}
