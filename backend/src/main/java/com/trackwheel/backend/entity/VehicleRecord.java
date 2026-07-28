package com.trackwheel.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicle_records")
public class VehicleRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String token;

    private String regNo;
    private String phone;
    private String type;

    private String color;
    private String cycleType;
    private String slot;

    @Lob
    @Column(columnDefinition="LONGTEXT")
    private String photoData;

    private LocalDateTime inTime;
    private LocalDateTime outTime;

    @Enumerated(EnumType.STRING)
    private Status status;

    private Double fee;

    public enum Status {
        ACTIVE, COMPLETED
    }
}
