package com.ConnectSphere.crmji.controller;

import com.ConnectSphere.crmji.model.Activity;
import com.ConnectSphere.crmji.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// DTO for creating a new Activity
record CreateActivityRequest(
        String type,
        String subject,
        String notes,
        LocalDateTime dueDate,
        Boolean completed,
        Long contactId,
        Long dealId
) {}

// DTO for updating an existing Activity
record UpdateActivityRequest(
        String type,
        String subject,
        String notes,
        LocalDateTime dueDate,
        Boolean completed,
        Long contactId,
        Long dealId
) {}

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @GetMapping
    public ResponseEntity<Object> getAllActivities() {
        List<Activity> activities = activityService.getAllActivities();
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getActivityById(@PathVariable Long id) {
        Optional<Activity> activity = activityService.getActivityById(id);
        return activity.isPresent() ?
                new ResponseEntity<>(activity.get(), HttpStatus.OK) :
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND);
    }

    @GetMapping("/contact/{contactId}")
    public ResponseEntity<Object> getActivitiesByContact(@PathVariable Long contactId) {
        List<Activity> activities = activityService.getActivitiesByContact(contactId);
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/deal/{dealId}")
    public ResponseEntity<Object> getActivitiesByDeal(@PathVariable Long dealId) {
        List<Activity> activities = activityService.getActivitiesByDeal(dealId);
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<Object> getUpcomingActivities() {
        List<Activity> activities = activityService.getUpcomingActivities();
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/overdue")
    public ResponseEntity<Object> getOverdueActivities() {
        List<Activity> activities = activityService.getOverdueActivities();
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/completed")
    public ResponseEntity<Object> getCompletedActivities() {
        List<Activity> activities = activityService.getCompletedActivities();
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<Object> getActivitiesByType(@PathVariable String type) {
        List<Activity> activities = activityService.getActivitiesByType(type);
        return activities.isEmpty() ?
                new ResponseEntity<>("no data", HttpStatus.NOT_FOUND) :
                new ResponseEntity<>(activities, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> createActivity(@RequestBody CreateActivityRequest request) {
        try {
            Activity newActivity = new Activity();
            newActivity.setType(request.type());
            newActivity.setSubject(request.subject());
            newActivity.setNotes(request.notes());
            newActivity.setDueDate(request.dueDate());
            newActivity.setCompleted(request.completed() != null ? request.completed() : false);

            // Set contact relationship if provided
            if (request.contactId() != null) {
                com.ConnectSphere.crmji.model.Contact contact = new com.ConnectSphere.crmji.model.Contact();
                contact.setId(request.contactId());
                newActivity.setContact(contact);
            }

            // Set deal relationship if provided
            if (request.dealId() != null) {
                com.ConnectSphere.crmji.model.Deal deal = new com.ConnectSphere.crmji.model.Deal();
                deal.setId(request.dealId());
                newActivity.setDeal(deal);
            }

            Activity savedActivity = activityService.createActivity(newActivity);
            return new ResponseEntity<>(savedActivity, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateActivity(@PathVariable Long id, @RequestBody UpdateActivityRequest request) {
        try {
            Activity activityDetails = new Activity();
            activityDetails.setType(request.type());
            activityDetails.setSubject(request.subject());
            activityDetails.setNotes(request.notes());
            activityDetails.setDueDate(request.dueDate());
            activityDetails.setCompleted(request.completed());

            if (request.contactId() != null) {
                com.ConnectSphere.crmji.model.Contact contact = new com.ConnectSphere.crmji.model.Contact();
                contact.setId(request.contactId());
                activityDetails.setContact(contact);
            }

            if (request.dealId() != null) {
                com.ConnectSphere.crmji.model.Deal deal = new com.ConnectSphere.crmji.model.Deal();
                deal.setId(request.dealId());
                activityDetails.setDeal(deal);
            }

            Optional<Activity> updatedActivity = activityService.updateActivity(id, activityDetails);
            return updatedActivity.isPresent() ?
                    new ResponseEntity<>(updatedActivity.get(), HttpStatus.OK) :
                    new ResponseEntity<>("activity not found", HttpStatus.NOT_FOUND);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteActivity(@PathVariable Long id) {
        boolean wasDeleted = activityService.deleteActivity(id);
        if (wasDeleted) {
            return new ResponseEntity<>("Activity deleted at: " + LocalDateTime.now(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Activity not found", HttpStatus.NOT_FOUND);
        }
    }
}