package com.ConnectSphere.crmji.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity // Marks this class as a JPA Entity, meaning it will be mapped to a database table.
@Table(name = "leads") // Explicitly specifies the name of the database table.
@Data // Lombok: Generates getters, setters, toString, equals, and hashCode methods.
@NoArgsConstructor // Lombok: Generates a no-argument constructor.
@AllArgsConstructor // Lombok: Generates a constructor with all arguments.
public class Lead {
    @Id // Marks this field as the primary key of the table.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Configures the way of incrementing the primary key. IDENTITY uses MySQL's auto-increment.
    private Long id;

    @Column(name = "first_name", nullable = false, length = 50) // Maps to a column, specifies it cannot be null, and sets a max length.
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @Column(name = "email", unique = true, length = 100) // 'unique=true' creates a database constraint to prevent duplicate emails.
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "company", length = 100)
    private String company;

    @Column(name = "status", length = 100)
    private String status;

    @Column(name = "created_at", updatable = false) // 'updatable = false' means this value is set once and never updated.
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist // JPA lifecycle callback. This method is automatically called before the entity is persisted (saved for the first time).
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now(); // Set both times on creation
    }

    @PreUpdate // JPA lifecycle callback. This method is automatically called before the entity is updated.
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

