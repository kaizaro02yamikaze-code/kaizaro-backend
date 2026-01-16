/**
 * KAIZARO DASHBOARD LOGIC
 * Handles Role-based rendering, Navigation, and Data Mocking.
 */

// --- 1. MOCK DATA (Simulating a Database) ---
const MockDB = {
    stats: {
        OWNER: [
            { label: 'Total Students', value: '1,240', icon: 'users' },
            { label: 'Total Revenue', value: '$45k', icon: 'dollar-sign' },
            { label: 'Active Staff', value: '34', icon: 'briefcase' }
        ],
        TEACHER: [
            { label: 'My Classes', value: '4', icon: 'book-open' },
            { label: 'Assignments', value: '12', icon: 'file-text' },
            { label: 'Avg Attendance', value: '92%', icon: 'check-circle' }
        ],
        STUDENT: [
            { label: 'Attendance', value: '88%', icon: 'clock' },
            { label: 'Avg Grade', value: 'A-', icon: 'award' },
            { label: 'Pending Tasks', value: '3', icon: 'alert-circle' }
        ]
    },
    users: [
        { name: "Rahul Sharma", role: "Teacher", status: "Active", email: "rahul@kaizaro.com" },
        { name: "Priya Patel", role: "Student", status: "Active", email: "priya@student.com" },
        { name: "Amit Singh", role: "Teacher", status: "Leave", email: "amit@kaizaro.com" },
        { name: "Neha Gupta", role: "Student", status: "Active", email: "neha@student.com" },
    ]
};

// --- 2. CONFIGURATION ---
const AppConfig = {
    roles: {
        OWNER: {
            nav: [
                { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' },
                { id: 'staff', label: 'Staff Management', icon: 'users' },
                { id: 'finance', label: 'Finances', icon: 'wallet' },
                { id: 'settings', label: 'Settings', icon: 'settings' }
            ]
        },
        TEACHER: {
            nav: [
                { id: 'dashboard', label: 'Overview', icon: 'layout-dashboard' },
                { id: 'classes', label: 'My Classes', icon: 'book' },
                { id: 'students', label: 'Student List', icon: 'user-check' }
            ]
        },
        STUDENT: {
            nav: [
                { id: 'dashboard', label: 'My Learning', icon: 'layout-dashboard' },
                { id: 'schedule', label: 'Schedule', icon: 'calendar' },
                { id: 'results', label: 'Results', icon: 'bar-chart-2' }
            ]
        }
    }
};

// --- 3. MAIN LOGIC CLASS ---
const App = {
    user: null,

    init: () => {
        // Check Auth
        const storedUser = localStorage.getItem('kaizaro_user');
        if (!storedUser) {
            window.location.href = 'index.html'; // Redirect if no login
            return;
        }
        App.user = JSON.parse(storedUser);

        // Render UI
        UI.renderSidebar();
        UI.renderUserProfile();
        
        // Load Default View
        App.navigate('dashboard');
        
        // Initialize Icons
        lucide.createIcons();
    },

    navigate: (viewId) => {
        // Update Active Nav State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const activeBtn = document.getElementById(`nav-${viewId}`);
        if(activeBtn) activeBtn.classList.add('active');

        // Render Content
        UI.renderMainContent(viewId);
    },

    logout: () => {
        if(confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('kaizaro_user');
            window.location.href = 'index.html'; // Assuming setup.html is index or linked
        }
    }
};

// --- 4. UI RENDERER ---
const UI = {
    container: document.getElementById('mainContainer'),

    renderSidebar: () => {
        const role = App.user.role; // OWNER, TEACHER, or STUDENT
        const navItems = AppConfig.roles[role].nav;
        const navContainer = document.getElementById('navContainer');

        let html = '';
        navItems.forEach(item => {
            html += `
                <div id="nav-${item.id}" class="nav-item" onclick="App.navigate('${item.id}')">
                    <i data-lucide="${item.icon}" size="20"></i> ${item.label}
                </div>
            `;
        });
        navContainer.innerHTML = html;
    },

    renderUserProfile: () => {
        let displayName = "User";
        let subText = App.user.role;

        // Customize based on what data we have
        if (App.user.role === 'OWNER') displayName = App.user.instituteName;
        if (App.user.role === 'TEACHER') displayName = "Staff Member"; 
        if (App.user.role === 'STUDENT') {
            displayName = "Student";
            subText = `${App.user.class} - ${App.user.batch}`;
        }

        document.getElementById('userName').innerText = displayName;
        document.getElementById('userRole').innerText = subText;
        document.getElementById('userInitial').innerText = displayName.charAt(0).toUpperCase();
    },

    renderMainContent: (viewId) => {
        const role = App.user.role;
        UI.container.innerHTML = ''; // Clear current content
        
        // -- HEADER --
        const greeting = new Date().getHours() < 12 ? "Good Morning" : "Welcome back";
        let contentHTML = `
            <div class="header">
                <div>
                    <h1>${viewId === 'dashboard' ? greeting : capitalize(viewId)}</h1>
                    <p>Here is what's happening in your workspace today.</p>
                </div>
                ${viewId === 'staff' || viewId === 'students' ? 
                  `<button class="btn-primary" onclick="UI.openModal('${viewId}')">
                    <i data-lucide="plus"></i> Add New
                   </button>` : ''}
            </div>
        `;

        // -- BODY CONTENT SWITCHER --
        if (viewId === 'dashboard') {
            // Render Stats Cards
            const stats = MockDB.stats[role];
            contentHTML += `<div class="grid-3">`;
            stats.forEach(stat => {
                contentHTML += `
                    <div class="card">
                        <div class="icon-box"><i data-lucide="${stat.icon}" size="24"></i></div>
                        <div class="stat-lbl">${stat.label}</div>
                        <div class="stat-val">${stat.value}</div>
                    </div>
                `;
            });
            contentHTML += `</div>`;

            // Render Recent Table (For Owner/Teacher)
            if (role !== 'STUDENT') {
                contentHTML += `
                    <div style="margin-top:30px;">
                        <h3 style="margin-bottom:15px; font-size:1.1rem;">Recent Users</h3>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Role</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${MockDB.users.map(u => `
                                        <tr>
                                            <td><span style="font-weight:500">${u.name}</span></td>
                                            <td>${u.role}</td>
                                            <td style="color:var(--text-muted)">${u.email}</td>
                                            <td><span class="badge ${u.status === 'Active' ? 'success' : 'danger'}">${u.status}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                 // Student View Placeholder
                 contentHTML += `<div class="card" style="margin-top:20px; text-align:center; padding:40px; color:var(--text-muted)">
                    <i data-lucide="bar-chart" size="40" style="margin-bottom:10px;"></i>
                    <p>Your performance charts will appear here.</p>
                 </div>`;
            }
        } else {
            // Generic Empty State for other tabs
            contentHTML += `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; color:var(--text-muted); border:2px dashed var(--border); border-radius:12px;">
                    <i data-lucide="hammer" size="48" style="margin-bottom:15px; opacity:0.5;"></i>
                    <p>This module is currently under development.</p>
                </div>
            `;
        }

        UI.container.innerHTML = contentHTML;
        lucide.createIcons(); // Refresh icons
    },

    // --- MODAL LOGIC ---
    openModal: (type) => {
        const modal = document.getElementById('modalOverlay');
        const content = document.getElementById('modalContent');
        const title = document.getElementById('modalTitle');

        title.innerText = type === 'staff' ? "Add New Staff" : "Register Student";
        
        content.innerHTML = `
            <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" placeholder="e.g. John Doe">
            </div>
            <div class="form-group">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" placeholder="e.g. john@example.com">
            </div>
            <button class="btn-primary" style="width:100%; justify-content:center;" onclick="UI.closeModal()">
                Confirm & Create
            </button>
        `;

        modal.classList.add('open');
        lucide.createIcons();
    },

    closeModal: () => {
        document.getElementById('modalOverlay').classList.remove('open');
    }
};

// Utility
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Start App
document.addEventListener('DOMContentLoaded', App.init);