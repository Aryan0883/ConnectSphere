package com.ConnectSphere.crmji.repository;

import com.ConnectSphere.crmji.model.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Marks this interface as a Spring Data Repository bean, enabling exception translation and component scanning.
// JpaRepository<Contact, Long> provides CRUD methods (save, findById, findAll, delete, etc.) for the Contact entity with a primary key of type Long.
public interface ContactRepository extends JpaRepository<Contact, Long> {

    // Spring Data JPA will automatically implement this method based on its name.
    // It translates to: "SELECT * FROM contacts WHERE email = ?"
    // Returns the result wrapped in an Optional to handle null cases gracefully.
    Optional<Contact> findByEmail(String email);

    // Example of a custom query method to find contacts by their company name.
    // The method name is parsed by Spring Data JPA to create the query.
    // List<Contact> findByCompany(String company);
}
