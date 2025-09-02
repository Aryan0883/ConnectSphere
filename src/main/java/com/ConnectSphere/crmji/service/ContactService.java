package com.ConnectSphere.crmji.service;

import com.ConnectSphere.crmji.model.Contact;
import com.ConnectSphere.crmji.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service // Marks this class as a Service layer Spring bean, where business logic is typically implemented.
public class ContactService {

    // Injects an instance of ContactRepository into this class.
    @Autowired
    private ContactRepository contactRepository;

    /**
     * Retrieves all contacts from the database.
     * @return a List of all Contact entities.
     */
    public List<Contact> getAllContacts() {
        // JpaRepository provides the findAll() method.
        return contactRepository.findAll();
    }

    /**
     * Retrieves a specific contact by its unique ID.
     * @param id the ID of the contact to find.
     * @return an Optional containing the found Contact or an empty Optional if not found.
     */
    public Optional<Contact> getContactById(Long id) {
        // JpaRepository provides the findById() method.
        return contactRepository.findById(id);
    }

    /**
     * Creates a new contact and saves it to the database.
     * @param contact the Contact object to be created.
     * @return the saved Contact object (now with a generated ID and timestamps).
     */
    public Contact createContact(Contact contact) {
        // JpaRepository provides the save() method.
        // The @PrePersist method in the Entity will set the timestamps.
        return contactRepository.save(contact);
    }

    /**
     * Updates an existing contact.
     * @param id the ID of the contact to update.
     * @param contactDetails the Contact object containing the updated data.
     * @return an Optional containing the updated Contact if found, or an empty Optional if not found.
     */
    public Optional<Contact> updateContact(Long id, Contact contactDetails) {
        // 1. Find the existing contact
        Optional<Contact> existingContactOptional = contactRepository.findById(id);

        if (existingContactOptional.isPresent()) {
            Contact existingContact = existingContactOptional.get();

            // 2. Update the fields of the existing contact with new values
            existingContact.setFirstName(contactDetails.getFirstName());
            existingContact.setLastName(contactDetails.getLastName());
            existingContact.setEmail(contactDetails.getEmail());
            existingContact.setPhone(contactDetails.getPhone());
            existingContact.setCompany(contactDetails.getCompany());
            existingContact.setJobTitle(contactDetails.getJobTitle());
            existingContact.setNotes(contactDetails.getNotes());
            // Note: Timestamps are automatically handled by @PreUpdate

            // 3. Save the updated contact back to the database
            Contact updatedContact = contactRepository.save(existingContact);
            return Optional.of(updatedContact);
        } else {
            // Return an empty Optional if the contact wasn't found
            return Optional.empty();
        }
    }

    /**
     * Deletes a contact from the database.
     * @param id the ID of the contact to delete.
     * @return true if the contact was found and deleted, false otherwise.
     */
    public boolean deleteContact(Long id) {
        // 1. Check if the contact exists
        if (contactRepository.existsById(id)) {
            // 2. If it exists, delete it
            contactRepository.deleteById(id);
            return true;
        } else {
            return false;
        }
    }
}
