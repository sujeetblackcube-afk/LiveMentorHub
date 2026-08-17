# Internal Teacher Module Refactor

This folder contains the teacher portal refactor split into domain-focused modules.

Important:
- Public endpoints remain unchanged and are still served by backend/routes/teacherRoute.js.
- These internals are organized for maintainability and gradual migration only.
- Nothing in app.js mounts this module by default.
