# Specification

## Summary
**Goal:** Implement a three-role access system with a faculty verification workflow for Student Coordinators, and enforce booking permissions accordingly across backend and frontend.

**Planned changes:**
- Extend the backend role model to support Student, Student Coordinator, and Faculty, and keep existing profile APIs working with the new role variants.
- Add backend persistence + Faculty-only APIs to list, approve, and reject pending Student Coordinator verification requests; store coordinators as unverified by default until approved.
- Update backend authorization so only Faculty and verified Student Coordinators can create/cancel bookings; Students and unverified coordinators remain read-only for booking mutations while retaining read access to schedules/event details.
- Update registration UI to select among the three roles and clearly explain that Student Coordinators require faculty approval before booking/canceling.
- Update frontend permission/read-only gating to depend on role plus coordinator verification status; hide/disable booking and cancellation actions when the user lacks booking permissions and show an English needs-approval notice where applicable.
- Add a Faculty-only “Approvals” dashboard/tab to view pending coordinator requests and approve/reject them with loading/success/error states and refresh behavior.
- Show Student Coordinator verification status in the Profile dashboard (e.g., pending vs verified) and ensure it updates after faculty actions (via refresh/reload or query invalidation).
- Update shared type bindings and React Query hooks to support the new role + verification fields, adding new hooks for pending requests and approve/reject while keeping existing hooks functioning with minimal changes.

**User-visible outcome:** Users can register as Student, Student Coordinator, or Faculty; Student Coordinators must be approved by Faculty before they can book/cancel venues. Faculty can manage coordinator approval requests in a dedicated UI, and the app consistently enforces read-only vs booking permissions based on role and verification status.
