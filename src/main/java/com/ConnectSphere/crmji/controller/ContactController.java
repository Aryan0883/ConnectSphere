package com.ConnectSphere.crmji.controller;

// Spring Web Annotations for building REST APIs
import com.ConnectSphere.crmji.model.Contact;
import com.ConnectSphere.crmji.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

// Java 21 - Using Records for Data Transfer Objects (DTOs)
// A Record is a transparent carrier for immutable data. Perfect for DTOs.
/**
 * DTO (Data Transfer Object) for creating a new Contact.
 * Used to decouple the API layer from the persistence layer.
 * @param firstName
 * @param lastName
 * @param email
 * @param phone
 * @param company
 * @param jobTitle
 * @param notes
 */
record CreateContactRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String jobTitle,
        String notes
) {}

/**
 * DTO for updating an existing Contact.
 * All fields are optional (can be null).
 * @param firstName
 * @param lastName
 * @param email
 * @param phone
 * @param company
 * @param jobTitle
 * @param notes
 */
record UpdateContactRequest(
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String jobTitle,
        String notes
) {}

@RestController // Marks this class as a Controller where every method returns a domain object instead of a view.
@RequestMapping("/api/contacts") // Maps all HTTP requests starting with '/api/contacts' to this controller.
public class ContactController {

    // Injects the Service layer bean
    @Autowired
    private ContactService contactService;

    /**
     * GET /api/contacts
     * Fetches all contacts in the system.
     * @return ResponseEntity with a list of all Contacts and HTTP status 200 (OK).
     */
//    @GetMapping
//    public ResponseEntity<List<Contact>> getAllContacts() {
//        // Delegate the call to the Service layer
//        List<Contact> contacts = contactService.getAllContacts();
//        // Wrap the list in a ResponseEntity with an OK status
//        return new ResponseEntity<>(contacts, HttpStatus.OK);
//    }
    @GetMapping
    public ResponseEntity<Object> getAllContacts() {
        // Delegate the call to the Service layer
        List<Contact> contacts = contactService.getAllContacts();

        // Check if the list is empty
        if (contacts.isEmpty()) {
            // Return a message with a NOT_FOUND status
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        } else {
            // Wrap the list in a ResponseEntity with an OK status
            return new ResponseEntity<>(contacts, HttpStatus.OK);
        }
    }

    /**
     * GET /api/contacts/{id}
     * Fetches a single contact by its unique ID.
     * @param id The path variable representing the Contact's ID.
     * @return ResponseEntity with the found Contact and status 200 (OK),
     *         or status 404 (NOT FOUND) if the contact doesn't exist.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Object> getContactById(@PathVariable Long id) {
        // Service returns an Optional to handle the "not found" case
        Optional<Contact> contact = contactService.getContactById(id);

        // Use a conditional check to handle the two cases
        if (contact.isPresent()) {
            // If found, return the contact with an OK status
            return new ResponseEntity<>(contact.get(), HttpStatus.OK);
        } else {
            // If empty, return a "no data" message with a NOT_FOUND status
            return new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
        }
    }

    /**
     * POST /api/contacts
     * Creates a new contact.
     * @param request The request body, automatically deserialized from JSON into a CreateContactRequest record.
     * @return ResponseEntity with the newly created Contact and status 201 (CREATED).
     */
    @PostMapping
    public ResponseEntity<Contact> createContact(@RequestBody CreateContactRequest request) {
        // Map the DTO (CreateContactRequest) to the Entity (Contact)
        Contact newContact = new Contact();
        newContact.setFirstName(request.firstName());
        newContact.setLastName(request.lastName());
        newContact.setEmail(request.email());
        newContact.setPhone(request.phone());
        newContact.setCompany(request.company());
        newContact.setJobTitle(request.jobTitle());
        newContact.setNotes(request.notes());
        // Timestamps (createdAt, updatedAt) are set automatically by the Entity's @PrePersist method

        // Delegate the save operation to the Service layer
        Contact savedContact = contactService.createContact(newContact);

        // Return the saved entity with a CREATED status
        return new ResponseEntity<>(savedContact, HttpStatus.CREATED);
    }

    /**
     * PUT /api/contacts/{id}
     * Fully updates an existing contact. Replaces all fields with the values provided.
     * @param id The path variable representing the Contact's ID to update.
     * @param request The request body containing the new values for the contact.
     * @return ResponseEntity with the updated Contact and status 200 (OK),
     *         or status 404 (NOT FOUND) if the contact doesn't exist.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(@PathVariable Long id, @RequestBody UpdateContactRequest request) {
        // Map the DTO to an Entity object to pass to the service
        Contact contactDetails = new Contact();
        contactDetails.setFirstName(request.firstName());
        contactDetails.setLastName(request.lastName());
        contactDetails.setEmail(request.email());
        contactDetails.setPhone(request.phone());
        contactDetails.setCompany(request.company());
        contactDetails.setJobTitle(request.jobTitle());
        contactDetails.setNotes(request.notes());

        // Delegate the update operation to the Service layer
        Optional<Contact> updatedContact = contactService.updateContact(id, contactDetails);

        // Handle the Optional response from the service
        return updatedContact.map( contact -> new ResponseEntity<>(contact, HttpStatus.OK) )
                .orElse( new ResponseEntity<>(HttpStatus.NOT_FOUND) );
    }

    /**
     * DELETE /api/contacts/{id}
     * Deletes a contact by its ID.
     * @param id The path variable representing the Contact's ID to delete.
     * @return ResponseEntity with status 204 (NO CONTENT) if deleted successfully,
     *         or status 404 (NOT FOUND) if the contact doesn't exist.
     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
//        // Call the service method which returns a boolean indicating success
//        boolean wasDeleted = contactService.deleteContact(id);
//
//        // Return the appropriate HTTP status based on the result
//        HttpStatus status = wasDeleted ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND;
//        return new ResponseEntity<>(status);
//    }
//    @DeleteMapping("/{id}")
//    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
//        // Call the service method which returns a boolean indicating success
//        boolean wasDeleted = contactService.deleteContact(id);
//
//        // Return the appropriate HTTP status and body based on the result
//        if (wasDeleted) {
//            return new ResponseEntity<>("deleted", HttpStatus.OK);
//        } else {
//            return new ResponseEntity<>("not found", HttpStatus.NOT_FOUND);
//        }
//    }
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteContact(@PathVariable Long id) {
        boolean wasDeleted = contactService.deleteContact(id);

        if (wasDeleted) {
            String timestamp = java.time.LocalDateTime.now().toString();
            String responseMessage = "Contact deleted at: " + timestamp;
            return new ResponseEntity<>(responseMessage, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Contact not found", HttpStatus.NOT_FOUND);
        }
    }
}
