package com.ConnectSphere.crmji.service;

import com.ConnectSphere.crmji.model.Activity;
import com.ConnectSphere.crmji.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ContactService contactService;

    @Autowired
    private DealService dealService;

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public Optional<Activity> getActivityById(Long id) {
        return activityRepository.findById(id);
    }

    public Activity createActivity(Activity activity) {
        // Validate relationships if provided
        if (activity.getContact() != null && activity.getContact().getId() != null) {
            if (!contactService.getContactById(activity.getContact().getId()).isPresent()) {
                throw new IllegalArgumentException("Contact not found with ID: " + activity.getContact().getId());
            }
        }

        if (activity.getDeal() != null && activity.getDeal().getId() != null) {
            if (!dealService.getDealById(activity.getDeal().getId()).isPresent()) {
                throw new IllegalArgumentException("Deal not found with ID: " + activity.getDeal().getId());
            }
        }

        return activityRepository.save(activity);
    }

    public Optional<Activity> updateActivity(Long id, Activity activityDetails) {
        Optional<Activity> existingActivityOptional = activityRepository.findById(id);

        if (existingActivityOptional.isPresent()) {
            Activity existingActivity = existingActivityOptional.get();

            // Update fields if provided
            if (activityDetails.getType() != null) {
                existingActivity.setType(activityDetails.getType());
            }
            if (activityDetails.getSubject() != null) {
                existingActivity.setSubject(activityDetails.getSubject());
            }
            if (activityDetails.getNotes() != null) {
                existingActivity.setNotes(activityDetails.getNotes());
            }
            if (activityDetails.getDueDate() != null) {
                existingActivity.setDueDate(activityDetails.getDueDate());
            }
            if (activityDetails.getCompleted() != null) {
                existingActivity.setCompleted(activityDetails.getCompleted());
            }

            return Optional.of(activityRepository.save(existingActivity));
        }

        return Optional.empty();
    }

    public boolean deleteActivity(Long id) {
        if (activityRepository.existsById(id)) {
            activityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Custom business methods
    public List<Activity> getActivitiesByContact(Long contactId) {
        return activityRepository.findByContactId(contactId);
    }

    public List<Activity> getActivitiesByDeal(Long dealId) {
        return activityRepository.findByDealId(dealId);
    }

    public List<Activity> getUpcomingActivities() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);
        return activityRepository.findByDueDateBetween(now, tomorrow);
    }

    public List<Activity> getOverdueActivities() {
        return activityRepository.findByDueDateBeforeAndCompletedFalse(LocalDateTime.now());
    }

    public List<Activity> getCompletedActivities() {
        return activityRepository.findByCompleted(true);
    }

    public List<Activity> getActivitiesByType(String type) {
        return activityRepository.findByType(type);
    }
}