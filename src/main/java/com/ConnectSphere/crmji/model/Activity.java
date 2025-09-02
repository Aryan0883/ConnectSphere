package com.ConnectSphere.crmji.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "activities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false, length = 50)
    private String type; // e.g., "CALL", "EMAIL", "MEETING", "TASK"

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "completed", nullable = false)
    private Boolean completed = false;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    @JsonIgnore // Prevent serialization issues
    private Contact contact; // Optional: activity can be associated with a contact

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id")
    @JsonIgnore // Prevent serialization issues
    private Deal deal; // Optional: activity can be associated with a deal

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Automatically set completion date when marked as completed
        if (Boolean.TRUE.equals(this.completed) && this.completionDate == null) {
            this.completionDate = LocalDateTime.now();
        }
    }
}