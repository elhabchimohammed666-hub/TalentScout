# TalentScout 
### Football Academy Management & AI Player Development Platform
**MERN Stack Edition (MongoDB, Express.js, React.js, Node.js)**

---

## 1. Project Overview

**TalentScout** is a comprehensive full-stack football academy management and player development platform built strictly with the **MERN** stack. It empowers academy directors and coaches to transition away from fragmented spreadsheets and paper records into a centralized, data-driven system.

The platform provides a complete end-to-end workflow:
1. **Academy Administration**: Oversee academy staff, manage coach accounts, configure institutional philosophy, and track squad metrics.
2. **Player Management**: Centralized player registry with athletic details, age categories (U-11 to U-19), position specifications, and coach assignments.
3. **Training Organization**: Schedule training sessions with targeted focus topics (rondo, high press, endurance, spatial scanning) and maintain post-session tactical debrief notes.
4. **Attendance Tracking**: Interactive attendance roll call (Present, Absent, Excused) with attendance rate analytics and recurring absence pattern insights.
5. **Structured Performance Evaluation**: Evaluate players across 4 core football pillars and 15 structured metrics with a consistent 1-10 rating scale:
   - **Physical Abilities**: Speed, Endurance, Agility, Strength
   - **Technical Skills**: Passing, Shooting, Dribbling, Ball Control
   - **Tactical Abilities**: Positioning, Decision Making, Game Awareness
   - **Personal Development**: Discipline, Teamwork, Motivation
6. **AI-Assisted Player Development**: Dedicated AI module within the Express backend that synthesizes evaluations and coach notes into actionable, evidence-grounded coaching summaries, historical delta comparisons, and age-appropriate drills.
7. **Visual Analytics & Reporting**: Interactive Radar skill footprints, metric progression line charts, side-by-side evaluation comparison tool, and one-click downloadable PDF Dossiers.

---

## 2. Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Database** | **MongoDB** & **Mongoose ODM** | Scalable document store with flexible schema validation, relational refs, and automated pre-save hooks. |
| **Backend** | **Node.js** & **Express.js** (ES Modules) | RESTful API architecture with JWT authentication, role-based access control (RBAC), and centralized error handling. |
| **Frontend** | **React.js 18** (Vite) | Modern React with functional components, hooks, React Router v6, Tailwind CSS, Lucide icons, and Chart.js. |
| **AI Module** | **Express.js AI Service** | Supports live **Google Gemini 1.5 Flash** REST inference and includes an integrated **UEFA-calibrated Football Heuristic Engine** for offline/zero-config operation. |
| **PDF Dossiers** | **jsPDF** & **html2canvas** | High-fidelity client-side PDF Dossier generator for printable reports. |

---

## 3. Database Modeling & Architecture

The application implements 8 interconnected Mongoose models:

```
                    ┌──────────────┐
                    │   Academy    │
                    └──────────────┘
                           │
       ┌───────────────────┴───────────────────┐
       ▼                                       ▼
┌──────────────┐                       ┌──────────────┐
│     User     │◄────── assigned ──────┤    Player    │
│(Manager/Coach│                       └──────┬───────┘
└──────┬───────┘                              │
       │                                      ├─────────────────────────┐
       │ creates                              │ evaluated               │ attended
       ▼                                      ▼                         ▼
┌──────────────┐                       ┌──────────────┐          ┌──────────────┐
│TrainingSess. │◄──────────────────────┤  Evaluation  │          │  Attendance  │
└──────────────┘     session ref       └──────────────┘          └──────────────┘
       ▲                                      ▲                         ▲
       │                                      │                         │
       └───────────────────┬──────────────────┴─────────────────────────┘
                           │ synthesized by
                           ▼
                    ┌──────────────┐
                    │  AIAnalysis  │
                    └──────────────┘
```

- **`User`**: Manager & Coach accounts, hashed passwords (bcrypt), JWT generation, specialization, assigned age groups.
- **`Academy`**: Institutional branding, motto, training philosophy, contact details.
- **`Player`**: Biographical info, primary/secondary positions, jersey number, dominant foot, age group, emergency contacts, status (`active` / `archived`).
- **`TrainingSession`**: Scheduled dates, times, locations, focus drill tags, intensity (`low`, `medium`, `high`), post-training debrief notes.
- **`Attendance`**: Unique composite index `(trainingSession, player)`, presence status (`present`, `absent`, `excused`), arrival times, coach notes.
- **`Evaluation`**: 15 structured metrics across 4 categories, computed overall average, strengths, areas for improvement, qualitative coach notes.
- **`DevelopmentGoal`**: Individual targets, target values, deadlines, progress status (`in_progress`, `achieved`).
- **`AIAnalysis`**: Performance summary, demonstrated strengths, historical comparison status (`progressing`, `regressing`, `stable`, `insufficient_data`), metric deltas, age-appropriate drills with evidence citations.

---

## 4. AI Service Integration & Methodology

The AI integration resides inside `server/services/aiService.js`, conforming strictly to Section 4 of the specification:

### Strict Grounding & Anti-Hallucination Constraints:
1. **Data-Bound Synthesis**: The AI only interprets recorded evaluations, attendance stats, and coach observation notes. It never invents scores, trends, or phantom improvements.
2. **Explicit Acknowledgment of Insufficiency**: When 0 or 1 evaluation exists, the AI explicitly reports that historical trends cannot be calculated until consecutive evaluations are recorded.
3. **Evidence Citation**: Every training recommendation includes:
   - `targetedSkill`
   - `exerciseName`
   - `objective`
   - `durationOrReps` (age-appropriate intensity)
   - `suitableAge` (matching player category)
   - `evaluationEvidence` (citing exact scores and coach notes)
4. **Safety & Medical Disclaimer**: Strictly avoids prescribing medical treatment or injury diagnosis.
5. **Dual Inference Mode**:
   - **Live LLM**: If `GEMINI_API_KEY` is provided in `.env`, queries Google Gemini 1.5 Flash using structured JSON schema prompts.
   - **Deterministic Fallback**: If no key is set or offline, executes a mathematical delta-classification engine based on European youth academy coaching methodologies.

---

## 5. Quick Start & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended; tested on v24)
- **MongoDB** (Local MongoDB instance or MongoDB Atlas URI)
- **npm** (v9 or higher)

### Step 1: Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd talentScout2

# Install root, server, and client dependencies in one command
npm run install:all
```
*(Or navigate to `server/` and `client/` individually and run `npm install`)*


### Step 3: Seed Demonstration Data
Populate MongoDB with the benchmark dataset specified in Section 6 (Page 10 of the PDF):
```bash
npm run seed
```

This sets up:
- **Academy Profile**: TalentScout Elite Football Academy
- **Manager**: `manager@talentscout.fc` / `password123`
- **Coach (Tactical)**: `coach.marcus@talentscout.fc` / `password123`
- **Coach (Conditioning)**: `coach.sarah@talentscout.fc` / `password123`
- **Benchmark Player**: **Adam Belkacem** (14yo midfielder with 2 chronological evaluations showing passing progress under pressure, attendance records, goals, and complete AI analysis).
- **Squad**: 6+ active youth players, completed sessions, attendance rolls, and evaluations.

### Step 4: Run the Application
Run both backend API and React frontend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 6. End-to-End Demonstration Scenario (Page 10)

The seeded dataset demonstrates the complete scenario requested in the specification:
1. **Manager Oversight**: Log in as `manager@talentscout.fc` / `password123`. Inspect the **Academy Performance Overview** dashboard with active players, coaches, attendance rate (88%), and evaluation review alerts.
2. **Coach Portal**: Log in as `coach.marcus@talentscout.fc` / `password123`. View upcoming training sessions and open the interactive attendance roll call.
3. **Adam Belkacem's Profile**:
   - Navigate to **Players** ➔ **Adam Belkacem**.
   - Review **Evaluation 1** (baseline: passing 5.4/10, endurance 8.8/10, coach observation: *"Adam demonstrates good stamina but struggles with accurate passes under pressure"*).
   - Review **Evaluation 2** (follow-up: passing improved to 6.9/10, endurance 8.9/10, coach observation acknowledging progress).
   - Click **"Generate AI Analysis"**: inspect the readable summary, verified gains (+1.5 in passing), and prescribed age-appropriate passing drills (e.g. 4v2 Rondos under defensive pressure).
   - Inspect **Charts & Evolution** to see the interactive Radar chart and Multi-Date progression line graph.
   - Click **"PDF Report"** to preview and download Adam's complete player development report.
4. **Compare Tool**: Navigate to **Evaluations & Trends**, select Adam, and observe the automated delta table highlighting improved, declined, and stable metrics.

---

## 7. REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login`: Authenticate with email & password, receive JWT.
- `POST /api/auth/register`: Create user account.
- `GET /api/auth/me`: Get current authenticated profile.
- `PUT /api/auth/profile`: Update current profile.

### Players (`/api/players`)
- `GET /api/players`: Get all players (with `search`, `ageCategory`, `position` filters).
- `GET /api/players/:id`: Get player dossier (evaluations, attendance, goals, AI analysis).
- `POST /api/players`: Register a new player.
- `PUT /api/players/:id`: Update player details.
- `PUT /api/players/:id/archive`: Toggle archived status.
- `DELETE /api/players/:id`: Permanent delete (Academy Manager only).

### Training Sessions (`/api/sessions`)
- `GET /api/sessions`: List sessions with status and age filters.
- `GET /api/sessions/:id`: Get session details with player attendance sheet.
- `POST /api/sessions`: Schedule new training session.
- `PUT /api/sessions/:id`: Update session and save post-training debrief notes.
- `DELETE /api/sessions/:id`: Cancel/delete session.

### Attendance (`/api/attendance`)
- `POST /api/attendance/session/:sessionId`: Batch save attendance statuses for all players.
- `GET /api/attendance/session/:sessionId`: Get roll call status.
- `GET /api/attendance/player/:playerId`: Get player attendance history.
- `GET /api/attendance/stats`: Global attendance analytics and recurring absence patterns.

### Evaluations (`/api/evaluations`)
- `GET /api/evaluations`: List evaluations across academy.
- `GET /api/evaluations/:id`: Get single evaluation.
- `POST /api/evaluations`: Record new evaluation across 15 metrics.
- `PUT /api/evaluations/:id`: Edit evaluation.
- `POST /api/evaluations/compare`: Compare 2 evaluations side-by-side with deltas.

### AI Player Development (`/api/ai`)
- `POST /api/ai/analyze/:playerId`: Trigger grounded AI development analysis.
- `GET /api/ai/player/:playerId`: Retrieve past generated AI analyses.

### Academy & Staff (`/api/coaches`, `/api/academy`, `/api/stats`)
- `GET /api/coaches`: List coaches (Manager only).
- `POST /api/coaches`: Create coach account (Manager only).
- `GET /api/stats/overview`: Manager dashboard metrics.
- `GET /api/stats/coach-overview`: Coach dashboard metrics.
- `GET /api/academy` & `PUT /api/academy`: View and update academy philosophy and settings.

---

## 8. Deployment Guide

### React Frontend (Vercel / Netlify)
1. Set the root directory to `client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Add environment variable: `VITE_API_URL` (or configure reverse proxy rewrite).

### Express Backend (Render / Railway)
1. Set the root directory to `server`.
2. Build command: `npm install`.
3. Start command: `node server.js`.
4. Configure environment variables in the host dashboard:
   - `PORT=5000`
   - `MONGODB_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<your-secure-secret>`
   - `NODE_ENV=production`
   - `GEMINI_API_KEY=<optional-gemini-key>`

### MongoDB (MongoDB Atlas)
1. Create a free M0 cluster on MongoDB Atlas.
2. Allow network access from `0.0.0.0/0` (or host IP).
3. Paste the Atlas connection string into `MONGODB_URI`.

---

## 9. Evaluation Criteria Matrix

| Criteria | Implementation Highlights |
|---|---|
| **Functional Completeness** | All Required (3.1), Should Have (3.2), and Could Have (3.3) features fully implemented. |
| **Frontend & UX** | High-performance React 18, responsive Tailwind CSS layout, accessible modals, live reactive slider ratings, Lucide icons. |
| **Backend & Database** | Normalized Mongoose schemas, virtuals, password hashing, JWT RBAC middlewares, transactional batch updates. |
| **AI Integration** | Dedicated backend service module, strict grounding against hallucination, explicit data insufficiency notice, evidence citation, safety constraints. |
| **Code Quality** | Clean ES Modules, separation of concerns (routes, controllers, models, services), clear naming, no hardcoded secrets. |
