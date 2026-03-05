# Specification

## Summary
**Goal:** Fix the Student Coordinator registration flow so that all faculty accounts automatically receive an in-app notification when a new Student Coordinator registers, and faculty can approve or reject the coordinator directly from their Notifications tab.

**Planned changes:**
- In the backend `registerProfile` logic, when a new profile with role `StudentCoordinator` is created, automatically create an in-app notification for every existing faculty account containing the coordinator's name, email, and principal, tagged for Approve/Reject actions.
- Update the `NotificationsDashboard` frontend component so faculty see a notification card for each pending coordinator with their name, email, and Approve/Reject buttons.
- When a faculty member clicks Approve or Reject, call the appropriate backend mutation to update the coordinator's verification status.
- Add a backend method (e.g., `resolveCoordinatorVerificationNotifications`) that removes or marks the coordinator's pending-approval notification as resolved from **all** faculty accounts' notification lists once any faculty member acts on it.
- The coordinator's profile Verification Status badge updates to Approved or Rejected after faculty action.

**User-visible outcome:** When a Student Coordinator registers, every faculty member sees a notification in their Notifications tab with the coordinator's details and Approve/Reject buttons. Once any faculty member acts, the coordinator's status updates and the notification is cleared from all faculty accounts.
