# AI Usage Notes

## Overview

AI is used as a pair-programming and learning assistant throughout this project. Instead of generating the entire solution in one step, the project was developed incrementally. Each feature was implemented individually, reviewed, tested, and understood before moving to the next one.

The primary goal of using AI was to understand backend development concepts, validate implementation approaches, and improve code quality while completing the assignment.

---

## How AI was used

AI assisted with:

- Explaining Express.js project structure and recommended folder organization.
- Suggesting a layered architecture using Routes, Controllers, Services, and Utility modules.
- Providing implementation examples for individual API endpoints.
- Explaining asynchronous file handling using async/await.
- Explaining Express middleware, centralized error handling, and request validation.
- Assisting with writing API tests using Jest and Supertest.
- Explaining Swagger/OpenAPI documentation and helping configure it.
- Assisting in debugging dependency and configuration issues during development.

The project was built feature by feature rather than generated in a single prompt.

---

## What I reviewed and validated

After each implementation step, I manually reviewed the generated code and verified that it met the assignment requirements.

This included:

- Testing every API endpoint using Postman.
- Verifying request validation and error responses.
- Checking that expenses were correctly stored and retrieved from the local JSON file.
- Verifying HTTP status codes and response formats.
- Running the Jest test suite and resolving any issues.
- Reviewing generated code before committing changes.

---

## Manual decisions and modifications

During development I made several implementation decisions, including:

- Keeping local JSON storage instead of introducing a database, as required by the assignment.
- Building the project incrementally with separate commits instead of generating everything at once.
- Reviewing and organizing the project structure for readability.
- Verifying endpoint behavior and ensuring responses were consistent across the API.
- Ensuring the project followed the required submission structure.

---

## AI suggestions that were not adopted

Some AI suggestions were intentionally not used, including:

- Using a database such as MongoDB, since the assignment explicitly allowed local storage.
- Adding authentication or user management, as these were outside the assignment scope.
- Introducing additional libraries that increased complexity without improving the required functionality.
- Implementing extra features beyond the selected optional bonus to keep the project focused.

---

## Learning outcomes

Working with AI helped me better understand several backend development concepts, including:

- Layered application architecture.
- Express middleware flow.
- Centralized error handling.
- File-based data persistence.
- API testing with Jest and Supertest.
- Swagger/OpenAPI documentation.
- REST API design and HTTP status codes.

Rather than treating AI as an automatic code generator, I used it as a learning tool to understand implementation choices and backend best practices while building the project.

---

## Summary

AI accelerated development by explaining concepts, suggesting implementation approaches, and helping debug issues. I reviewed the generated code, tested each feature, and ensured the final project satisfied the assignment requirements before submission.
