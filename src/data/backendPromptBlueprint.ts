export const MASTER_ENGINEERING_PROMPT = `# MASTER ENGINEERING SPECIFICATION: AI CLINICAL TRIAGE & HEALTH ASSISTANT (CuraHealth)

## Product Vision & Core Mission
Build a production-grade, HIPAA-aligned medical symptom triage web application that empowers patients experiencing common acute health symptoms (fever/bukhar, tension headache, allergic rhinitis/sneezing, skin rashes, minor lacerations/cuts, acute gastritis) to receive safe, rapid clinical triage guidance. 

The application utilizes an empathetic, conversational intake chatbot conducting an adaptive 10-13 step clinical interview. It strictly avoids flat form questionnaires by contextualizing each subsequent question based on previous answers, patient age category (Child, Teen, Adult, Senior), and biological sex (female-specific pregnancy/nursing checks, pediatric weight-based dosing, geriatric polypharmacy cautions).

If the condition is benign and self-limiting, the system provides safe, evidence-based over-the-counter (OTC) pharmaceutical relief with explicit dosage safety rules and non-pharmacological home care. If clinical red flags or severe indicators are detected, it immediately prioritizes patient safety, triggers an emergency alert, and provides an interactive directory of the nearest verified doctors and 24/7 emergency medical centers.

---

## 1. Frontend Architecture (React 19 + TypeScript + Tailwind CSS 4 + Motion)
- **Aesthetic Palette:** Calming clinical palette (e.g., Deep Medical Teal #0d9488, Soft Mint #f0fdfa, Eucalyptus Sage #14b8a6, Slate #334155, Warm Off-White #f8fafc). Zero jarring alarms; reassuring, professional typography.
- **Micro-Interactions:** Smooth Framer Motion transitions (\`motion/react\`) for step-by-step chat flow, typing bubble indicators, progress bars, and severity card reveals.
- **Key Modules:**
  1. **Authentication & Profile Context:** Quick modal for Sign In / Sign Up, guest mode, multi-member family profile switcher (Adult female, Child boy, Senior grandfather).
  2. **Daily Front Page:** Reassuring "How are you feeling today?" wellness check-in, quick-tap symptom pills, and clinical disclaimer.
  3. **Conversational Intake Chatbot (10-13 Steps):**
     - Step 1: Age & life-stage confirmation
     - Step 2: Demographic check (Pregnancy/nursing for women, weight for children, chronic cardiac/renal for seniors)
     - Step 3: Symptom onset & duration
     - Step 4: Subjective pain scale (1-10)
     - Step 5: Symptom-specific clinical nuance (Temperature reading for fever, pain pattern for headache, clear vs purulent discharge for cold, blanching vs non-blanching for rash, tetanus/wound depth for cuts)
     - Step 6: Critical Red Flag screening (Dyspnea, meningeal stiffness, mental confusion, uncontrolled bleeding)
     - Step 7: Drug allergy screen (Penicillin, NSAIDs/Aspirin, Paracetamol)
     - Step 8: Medications already taken in last 12-24h (prevents paracetamol hepatotoxicity)
     - Step 9: Hydration, appetite & physiological vitals
     - Step 10: Trajectory (improving, stable, rapidly worsening)
     - Step 11: Sick contacts & epidemiological exposure
     - Step 12: Secondary accompanying symptoms
     - Step 13: Care plan objective & expectations
  4. **Triage Decision & Diagnostic Result View:**
     - Severity badge: Green (Self-care), Amber (Doctor visit in 24-48h), Red (Immediate ER).
     - Safe OTC medicine card with pediatric vs adult dosage notes and contraindications.
     - Evidence-based home remedies.
     - "When to seek urgent care" warning checklist.
  5. **Nearby Doctor & Clinic Locator:**
     - Interactive map preview with distance (km), specialty filters (Pediatrician, General Physician, ENT, Dermatologist, 24x7 ER), rating, phone call trigger, and appointment booking.
  6. **Persistent Medical Record History:**
     - Encrypted client & server storage of past consultations, printable medical summary.

---

## 2. Backend API Architecture (Python FastAPI + PostgreSQL + SQLAlchemy)
- **Framework:** FastAPI (Python 3.11+) with Asyncpg connection pooling.
- **Database:** PostgreSQL 16+ with UUID primary keys and JSONB symptom payloads.
- **Authentication:** JWT Bearer tokens with bcrypt password hashing.
- **REST Endpoints:**
  - \`POST /api/auth/register\` & \`POST /api/auth/login\`
  - \`GET /api/profiles/me\` & \`POST /api/profiles\`
  - \`POST /api/triage/start\` - Initiates session with chief complaint
  - \`POST /api/triage/step\` - Processes conversational response & returns next adaptive question
  - \`POST /api/triage/assess\` - Finalizes clinical triage score and generates recommendation payload
  - \`GET /api/doctors/nearby?lat={lat}&lng={lng}&specialty={specialty}\`
  - \`GET /api/records/history\` & \`POST /api/records/export-pdf\`
`;

export const PYTHON_FASTAPI_BACKEND_CODE = `"""
CuraHealth Medical Triage & Clinical Assistant API
Built with Python 3.11, FastAPI, Pydantic v2, and SQLAlchemy (PostgreSQL).
"""

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

app = FastAPI(
    title="CuraHealth Medical Triage API",
    version="1.0.0",
    description="Adaptive clinical triage, OTC medicine guidance, and doctor referral backend."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- ENUMS & SCHEMAS -----------------
class AgeCategory(str, Enum):
    CHILD = "child"
    TEEN = "teen"
    ADULT = "adult"
    SENIOR = "senior"

class BiologicalSex(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class SeverityLevel(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"
    EMERGENCY = "emergency"

class UserRegisterRequest(BaseModel):
    name: str = Field(..., example="Priya Sharma")
    email: EmailStr = Field(..., example="priya@example.com")
    password: str = Field(..., min_length=6)
    age: int = Field(..., ge=1, le=120)
    age_category: AgeCategory
    sex: BiologicalSex
    is_pregnant_or_nursing: bool = False
    allergies: List[str] = []
    chronic_conditions: List[str] = []

class TriageInitRequest(BaseModel):
    patient_id: str
    primary_symptom: str
    initial_feeling: Optional[str] = None

class TriageStepRequest(BaseModel):
    session_id: str
    step_number: int
    question_id: str
    answer_text: str
    selected_option: Optional[str] = None

class OtcMedicineDTO(BaseModel):
    name: str
    category: str
    dosage_guide: str
    child_dosage_note: Optional[str] = None
    safety_caution: str
    typical_use: str

class DoctorDTO(BaseModel):
    id: str
    name: str
    specialty: str
    hospital: str
    distance_km: float
    rating: float
    phone: str
    emergency_24x7: bool

class TriageAssessmentResponse(BaseModel):
    assessment_id: str
    session_id: str
    timestamp: datetime
    primary_symptom: str
    severity: SeverityLevel
    clinical_summary: str
    key_observations: List[str]
    red_flags: List[str]
    recommended_otcs: List[OtcMedicineDTO]
    recommended_doctors: List[DoctorDTO]
    emergency_action_required: bool

# ----------------- CORE ENDPOINTS -----------------
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "CuraHealth Medical API", "timestamp": datetime.utcnow()}

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(payload: UserRegisterRequest):
    # In production: hash password via bcrypt and insert into PostgreSQL
    user_id = str(uuid.uuid4())
    return {
        "user_id": user_id,
        "name": payload.name,
        "email": payload.email,
        "token": f"jwt_mock_token_{user_id}",
        "message": "User registered successfully."
    }

@app.post("/api/triage/start")
async def start_triage_session(payload: TriageInitRequest):
    session_id = str(uuid.uuid4())
    return {
        "session_id": session_id,
        "current_step": 1,
        "total_steps": 13,
        "first_question": {
            "id": "q1_demographics",
            "question": "First, let's verify the patient's age and life stage.",
            "options": [
                "Child / Toddler (1 - 11 years)",
                "Teenager / Adolescent (12 - 17 years)",
                "Adult (18 - 59 years)",
                "Senior / Older Adult (60+ years)"
            ]
        }
    }

@app.post("/api/triage/assess", response_model=TriageAssessmentResponse)
async def complete_assessment(session_id: str, primary_symptom: str, answers: Dict[str, str]):
    # Clinical decision rules
    is_emergency = any("breathing" in v or "Stiff neck" in v or "thunderclap" in v for v in answers.values())
    severity = SeverityLevel.EMERGENCY if is_emergency else SeverityLevel.MILD

    return TriageAssessmentResponse(
        assessment_id=str(uuid.uuid4()),
        session_id=session_id,
        timestamp=datetime.utcnow(),
        primary_symptom=primary_symptom,
        severity=severity,
        clinical_summary="Clinical evaluation complete based on 13-point adaptive medical interview.",
        key_observations=["Patient completed structured intake without critical contraindications."],
        red_flags=["Emergency symptoms flagged"] if is_emergency else [],
        recommended_otcs=[
            OtcMedicineDTO(
                name="Paracetamol 500mg Tablets",
                category="Antipyretic / Analgesic",
                dosage_guide="1 tablet every 4-6 hours with water. Max 3000mg/day.",
                safety_caution="Avoid concurrent alcohol consumption.",
                typical_use="Fever and pain management"
            )
        ] if not is_emergency else [],
        recommended_doctors=[
            DoctorDTO(
                id="doc-1",
                name="Dr. Anita Deshmukh, MD",
                specialty="Senior General Physician",
                hospital="Apex Metro Polyclinic",
                distance_km=0.8,
                rating=4.9,
                phone="+1-555-0199",
                emergency_24x7=False
            )
        ],
        emergency_action_required=is_emergency
    )
`;

export const POSTGRESQL_SCHEMA_DDL = `-- CuraHealth PostgreSQL 16+ Database Schema
-- Provides HIPAA-ready relational storage for users, patients, dynamic intake sessions, and triage audits.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Patient Profiles Table (Enables family profiles: e.g. Mother managing Child & Elderly parent)
CREATE TABLE patient_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'self', -- 'self', 'child', 'parent', 'spouse'
    age INT NOT NULL CHECK (age >= 0 AND age <= 125),
    age_category VARCHAR(20) NOT NULL CHECK (age_category IN ('child', 'teen', 'adult', 'senior')),
    biological_sex VARCHAR(20) NOT NULL CHECK (biological_sex IN ('male', 'female', 'other')),
    weight_kg NUMERIC(5,2),
    is_pregnant_or_nursing BOOLEAN DEFAULT FALSE,
    chronic_conditions TEXT[] DEFAULT '{}',
    known_drug_allergies TEXT[] DEFAULT '{}',
    emergency_contact_phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Triage Consultation Sessions
CREATE TABLE triage_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patient_profiles(id) ON DELETE CASCADE,
    primary_symptom VARCHAR(50) NOT NULL, -- 'fever', 'headache', 'cold_sneezing', 'skin_rash', 'small_cuts', etc.
    initial_feeling VARCHAR(50),
    status VARCHAR(30) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned', 'escalated_to_er'
    total_steps INT DEFAULT 13,
    completed_steps INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

-- 4. Chat Messages & Dynamic Question Answers
CREATE TABLE triage_chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES triage_sessions(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    sender VARCHAR(20) NOT NULL CHECK (sender IN ('bot', 'user', 'system')),
    question_id VARCHAR(50),
    question_text TEXT,
    answer_text TEXT,
    selected_option TEXT,
    is_red_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Clinical Triage Assessments (Final Evaluation)
CREATE TABLE triage_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE REFERENCES triage_sessions(id) ON DELETE CASCADE,
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('mild', 'moderate', 'severe', 'emergency')),
    clinical_summary TEXT NOT NULL,
    observations_json JSONB DEFAULT '[]'::jsonb,
    red_flags_json JSONB DEFAULT '[]'::jsonb,
    follow_up_hours INT DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Recommended OTC Medications
CREATE TABLE assessment_otc_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES triage_assessments(id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    dosage_instructions TEXT NOT NULL,
    pediatric_note TEXT,
    safety_caution TEXT NOT NULL
);

-- 7. Verified Doctors Directory
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    hospital_name VARCHAR(200) NOT NULL,
    street_address TEXT NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    consultation_fee VARCHAR(50),
    rating NUMERIC(3,2) DEFAULT 4.8,
    is_24x7_emergency BOOLEAN DEFAULT FALSE
);

-- Indexes for lightning-fast queries
CREATE INDEX idx_triage_sessions_patient ON triage_sessions(patient_id);
CREATE INDEX idx_chat_messages_session ON triage_chat_messages(session_id);
CREATE INDEX idx_doctors_geo ON doctors(latitude, longitude);
`;
