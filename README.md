# Sweet Shop Management System
# Live website Link

https://sweet-shop-management-system-tan-seven.vercel.app/

## Introduction

Sweet Shop Management System is a full-stack web application designed to manage sweet inventory, user purchases, and admin operations for a sweet shop.  
This project is built using:

- **Frontend:** React (with Tailwind CSS for styling)
- **Backend:** Node.js, Express.js, MongoDB (Atlas)
- **Authentication:** JWT-based, with user roles (admin/user)
- **Testing:** Jest & Supertest for backend unit/integration tests
- **Deployment:** Backend on Render, Frontend on Vercel

---

## Features

- User registration and login (with role selection: user/admin)
- Admin dashboard for inventory management (add, edit, delete, restock sweets)
- User dashboard for browsing and purchasing sweets
- Secure API endpoints with role-based access control
- Responsive UI with modern design
- Comprehensive backend test coverage

---
sweet-shop-tdd/
├── backend/
│ ├── src/
│ ├── package.json
│ └── .env.example
├── frontend/
│ ├── src/
│ ├── package.json
│ └── .env.example
├── tests/
│ └── backend/
└── README.md



---

## Setup & Deployment

### Backend

1. **Install dependencies:**
   ```bash
   cd sweet-shop-tdd/backend
   npm install

   Configure environment variables:
Copy .env.example to .env and fill in your MongoDB Atlas URI and JWT secret.
Run locally:
- npm run dev

  Run tests:
- npm test

Deploy:
Deploy to Render with the root directory set to sweet-shop-tdd/backend.

Frontend:
Install dependencies:

- cd sweet-shop-tdd/frontend
- npm install

#Configure environment variables:
Copy .env.example to .env and set REACT_APP_API_URL to your backend API URL.

Run locally:
-npm start

Deploy:
Deploy to Vercel with the root directory set to sweet-shop-tdd/frontend.

#Commit History & AI Usage
Key Commits
feat: create and design all frontend pages, set up admin/user routing with AI tools
Scaffolded all main React pages, implemented routing, and used GitHub Copilot for component and UI generation.

feat: backend API and authentication
Developed Express routes, JWT authentication, and MongoDB models. Used Copilot for boilerplate and validation logic.

test: add database connection tests for MongoDB
Added Jest/Supertest tests for database and API endpoints. Used Copilot to generate and refine test cases.

fix: add missing default export to AdminRoute.jsx for proper admin route protection
Fixed a critical bug in route protection, suggested by Copilot.

config: update API URL for production deployment
Updated environment variables for deployment on Render and Vercel.

#Testing
Backend:
Unit and integration tests for authentication, sweets management, and inventory logic.
Run with npm test in the backend directory.
Frontend:
Manual testing for all user/admin flows.
(Optional) Add React Testing Library for component tests.

#My AI Usage
Tools Used
GitHub Copilot
Claude (Anthropic)
ChatGPT (OpenAI)

#Reflection
AI tools significantly accelerated my workflow, especially for repetitive code, boilerplate, and test generation.
They helped me avoid common mistakes, quickly scaffold new features, and focus more on architecture and business logic.
However, I always reviewed and adapted AI-generated code to ensure correctness, security, and maintainability.
AI was most helpful for:

Writing CRUD endpoints and validation logic
Debugging and fixing common React/Node issues
Improving documentation clarity
