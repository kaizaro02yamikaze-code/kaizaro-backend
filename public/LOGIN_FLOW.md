# Kaizaro Login & Role-Based Navigation Flow

## Complete User Journey

### 1. **Login (index.html)**
- User enters email and clicks "Continue"
- `handleEmailLogin()` creates user session
- **Clears** any previous role data (`kaizaro_selected_role`)
- **Redirects to:** `setup.html`

### 2. **Role Selection (setup.html)**
- User sees 3 role options: Owner, Teacher, Student
- User clicks on their role
- `navigateTo(role)` function:
  - **Saves role** to `localStorage.setItem('kaizaro_selected_role', role)`
  - **Redirects** to appropriate setup page

### 3. **Role-Specific Setup Pages**

#### **Owner → setup-owner.html**
- Owner fills institute details, permissions, policies
- On form submit:
  - Saves `kaizaro_owner_config` 
  - **Saves role:** `kaizaro_selected_role = 'OWNER'`
  - Sets flag: `kaizaro_owner_setup_complete = true`
  - **Redirects to:** `dashboard-owner.html`

#### **Teacher → setup-teacher.html**
- Teacher enters name, department, experience, subjects
- On form submit:
  - Saves `kaizaro_teacher_profile`
  - **Saves role:** `kaizaro_selected_role = 'TEACHER'`
  - Sets flag: `kaizaro_teacher_setup_complete = true`
  - **Redirects to:** `dashboard-teacher.html`

#### **Student → setup-student.html**
- Student enters name, roll number, batch, grade
- On form submit:
  - Saves `kaizaro_student_profile`
  - **Saves role:** `kaizaro_selected_role = 'STUDENT'`
  - Sets flag: `kaizaro_student_setup_complete = true`
  - **Redirects to:** `dashboard-student.html`

### 4. **Role-Specific Dashboards**
- `dashboard-owner.html` - Owner dashboard
- `dashboard-teacher.html` - Teacher dashboard
- `dashboard-student.html` - Student dashboard

## LocalStorage Keys Used

| Key | Value | Set By |
|-----|-------|--------|
| `sb-user` | User object (name, email, authType) | `index.js` |
| `kaizaro_selected_role` | 'OWNER' \| 'TEACHER' \| 'STUDENT' | `setup.html` & setup pages |
| `kaizaro_owner_config` | Owner config data | `setup-owner.html` |
| `kaizaro_owner_setup_complete` | 'true' | `setup-owner.js` |
| `kaizaro_teacher_profile` | Teacher profile data | `setup-teacher.js` |
| `kaizaro_teacher_setup_complete` | 'true' | `setup-teacher.js` |
| `kaizaro_student_profile` | Student profile data | `setup-student.js` |
| `kaizaro_student_setup_complete` | 'true' | `setup-student.js` |

## Testing the Flow

1. **Start at:** `http://localhost:3000`
2. **Login** with any email
3. **Select a role** (Owner/Teacher/Student)
4. **Complete setup form**
5. **Verify redirect** to correct dashboard
