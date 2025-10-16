package com.ConnectSphere.crmji.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity // Marks this class as a JPA Entity, meaning it will be mapped to a database table.
@Table(name = "deals") // Explicitly specifies the name of the database table.
@Data // Lombok: Generates getters, setters, toString, equals, and hashCode methods.
@NoArgsConstructor // Lombok: Generates a no-argument constructor.
@AllArgsConstructor // Lombok: Generates a constructor with all arguments.
public class Deal {

    @Id // Marks this field as the primary key of the table.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configures auto-increment using MySQL's identity column.
    private Long id;

    @Column(name = "name", nullable = false, length = 200) // Deal name/title, cannot be null
    private String name;

    @Column(name = "description", columnDefinition = "TEXT") // Detailed description of the deal
    private String description;

    @Column(name = "value", precision = 15, scale = 2) // Monetary value with 15 total digits and 2 decimal places
    private BigDecimal value;

    @Column(name = "stage", nullable = false, length = 50) // Current stage in sales pipeline
    private String stage; // e.g., "PROSPECTING", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"

    @Column(name = "probability") // Probability of closing the deal (0-100%)
    private Integer probability;

    @Column(name = "close_date") // Expected date when the deal will be closed
    private LocalDate closeDate;

    @Column(name = "created_at", updatable = false) // Timestamp when the deal was created (cannot be updated)
    private LocalDateTime createdAt;

    @Column(name = "updated_at") // Timestamp when the deal was last updated
    private LocalDateTime updatedAt;

    // Relationships
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) // Many Deals can be associated with One Contact
    @JoinColumn(name = "contact_id", nullable = false) // Foreign key column in deals table
    private Contact contact; // The contact person associated with this deal

    @PrePersist // JPA lifecycle callback: executed before the entity is persisted (saved for the first time)
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        // Set default probability based on stage if not provided
        if (this.probability == null && this.stage != null) {
            this.probability = calculateDefaultProbability(this.stage);
        }
    }

    @PreUpdate // JPA lifecycle callback: executed before the entity is updated
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Update probability if stage changed and probability wasn't explicitly set
        if (this.stage != null && this.probability == null) {
            this.probability = calculateDefaultProbability(this.stage);
        }
    }

    /**
     * Helper method to calculate default probability based on deal stage
     * @param stage The current stage of the deal
     * @return Default probability percentage (0-100)
     */
    private int calculateDefaultProbability(String stage) {
        return switch (stage.toUpperCase()) {
            case "PROSPECTING" -> 10;
            case "QUALIFICATION" -> 25;
            case "PROPOSAL" -> 50;
            case "NEGOTIATION" -> 75;
            case "CLOSED_WON" -> 100;
            case "CLOSED_LOST" -> 0;
            default -> 0;
        };
    }
}