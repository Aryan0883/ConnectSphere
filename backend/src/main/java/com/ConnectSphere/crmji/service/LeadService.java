package com.ConnectSphere.crmji.service;

import com.ConnectSphere.crmji.model.Lead;
import com.ConnectSphere.crmji.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Marks this class as a Service layer Spring bean, where business logic is typically implemented.
public class LeadService {

    // Injects an instance of LeadRepository into this class.
    @Autowired
    private LeadRepository leadRepository;

    /**
     * Retrieves all leads from the database.
     * @return a List of all Lead entities.
     */
    public List<Lead> getAllLeads() {
        // JpaRepository provides the findAll() method.
        return leadRepository.findAll();
    }

    /**
     * Retrieves a specific lead by its unique ID.
     * @param id the ID of the lead to find.
     * @return an Optional containing the found Lead or an empty Optional if not found.
     */
    public Optional<Lead> getLeadById(Long id) {
        // JpaRepository provides the findById() method.
        return leadRepository.findById(id);
    }

    /**
     * Creates a new lead and saves it to the database.
     * @param lead the Lead object to be created.
     * @return the saved Lead object (now with a generated ID and timestamps).
     */
    public Lead createLead(Lead lead) {
        // JpaRepository provides the save() method.
        // The @PrePersist method in the Entity will set the timestamps.
        return leadRepository.save(lead);
    }

    /**
     * Updates an existing lead.
     * @param id the ID of the lead to update.
     * @param leadDetails the Lead object containing the updated data.
     * @return an Optional containing the updated Lead if found, or an empty Optional if not found.
     */
    public Optional<Lead> updateLead(Long id, Lead leadDetails) {
        // 1. Find the existing lead
        Optional<Lead> existingLeadOptional = leadRepository.findById(id);

        if (existingLeadOptional.isPresent()) {
            Lead existingLead = existingLeadOptional.get();

            // 2. Update the fields of the existing lead with new values
            // Only update fields that are provided (not null) in leadDetails
            if (leadDetails.getFirstName() != null) {
                existingLead.setFirstName(leadDetails.getFirstName());
            }
            if (leadDetails.getLastName() != null) {
                existingLead.setLastName(leadDetails.getLastName());
            }
            if (leadDetails.getEmail() != null) {
                existingLead.setEmail(leadDetails.getEmail());
            }
            if (leadDetails.getPhone() != null) {
                existingLead.setPhone(leadDetails.getPhone());
            }
            if (leadDetails.getCompany() != null) {
                existingLead.setCompany(leadDetails.getCompany());
            }
            if (leadDetails.getStatus() != null) {
                existingLead.setStatus(leadDetails.getStatus());
            }
            // Note: Timestamps are automatically handled by @PreUpdate

            // 3. Save the updated lead back to the database
            Lead updatedLead = leadRepository.save(existingLead);
            return Optional.of(updatedLead);
        } else {
            // Return an empty Optional if the lead wasn't found
            return Optional.empty();
        }
    }

    /**
     * Deletes a lead from the database.
     * @param id the ID of the lead to delete.
     * @return true if the lead was found and deleted, false otherwise.
     */
    public boolean deleteLead(Long id) {
        // 1. Check if the lead exists
        if (leadRepository.existsById(id)) {
            // 2. If it exists, delete it
            leadRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Finds a lead by email address.
     * @param email the email address to search for.
     * @return an Optional containing the found Lead or an empty Optional if not found.
     */
    public Optional<Lead> getLeadByEmail(String email) {
        // Uses the custom method defined in LeadRepository
        return leadRepository.findByEmail(email);
    }

    /**
     * Updates only the status of a lead.
     * This is a specialized update method for changing lead status.
     * @param id the ID of the lead to update.
     * @param newStatus the new status to set for the lead.
     * @return an Optional containing the updated Lead if found, or an empty Optional if not found.
     */
    public Optional<Lead> updateLeadStatus(Long id, String newStatus) {
        Optional<Lead> existingLeadOptional = leadRepository.findById(id);

        if (existingLeadOptional.isPresent()) {
            Lead existingLead = existingLeadOptional.get();
            existingLead.setStatus(newStatus);
            // @PreUpdate will handle the updatedAt timestamp
            Lead updatedLead = leadRepository.save(existingLead);
            return Optional.of(updatedLead);
        } else {
            return Optional.empty();
        }
    }
}