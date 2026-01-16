/**
 * KAIZARO OWNER DASHBOARD LOGIC
 */

'use strict';

const OwnerApp = {
    // Mock Faculty Data
    faculty: [
        { id: "TCH-001", name: "Dr. A. Sharma", dept: "Physics", status: "Active", login: "2 mins ago" },
        { id: "TCH-002", name: "Prof. Sarah Jenkins", dept: "Mathematics", status: "Active", login: "1 hour ago" },
        { id: "TCH-003", name: "R. K. Gupta", dept: "Chemistry", status: "Inactive", login: "3 days ago" },
        { id: "TCH-004", name: "Emily Watson", dept: "Biology", status: "Active", login: "Yesterday" }
    ],

    init() {
        lucide.createIcons();
        this.loadOwnerConfig();
        this.renderFacultyTable();
    },

    // --- SETUP DATA LOADER ---
    loadOwnerConfig() {
        const configRaw = localStorage.getItem('kaizaro_owner_config');
        
        // Default values if setup wasn't run
        let config = {
            ownerName: "Administrator",
            instituteName: "Kaizaro Institute"
        };

        if (configRaw) {
            const parsed = JSON.parse(configRaw);
            config.ownerName = parsed.ownerName;
            config.instituteName = parsed.instituteName;
        }

        document.getElementById('owner-name-disp').innerText = config.ownerName;
        document.getElementById('institute-name-disp').innerText = config.instituteName;
    },

    // --- NAVIGATION ---
    switchTab(tabId, navEl) {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${tabId}`).classList.add('active');

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if(navEl) navEl.classList.add('active');
    },

    // --- FACULTY MANAGEMENT ---
    renderFacultyTable() {
        const tbody = document.getElementById('faculty-list');
        tbody.innerHTML = this.faculty.map(f => `
            <tr>
                <td style="font-family:'JetBrains Mono'; color:var(--text-muted);">${f.id}</td>
                <td style="color:white; font-weight:500;">${f.name}</td>
                <td>${f.dept}</td>
                <td>
                    <span class="status-dot ${f.status === 'Active' ? 'dot-green' : 'dot-red'}"></span>
                    ${f.status}
                </td>
                <td>${f.login}</td>
                <td>
                    <button class="btn-sm" onclick="OwnerApp.manageFaculty('${f.id}')">Manage</button>
                </td>
            </tr>
        `).join('');
    },

    addFaculty() {
        const name = prompt("Enter Faculty Name:");
        if (name) {
            this.faculty.unshift({
                id: "TCH-" + Math.floor(Math.random() * 900 + 100),
                name: name,
                dept: "General",
                status: "Inactive",
                login: "Never"
            });
            this.renderFacultyTable();
            alert(`Invitation sent to ${name}`);
        }
    },

    manageFaculty(id) {
        alert(`Managing settings for ${id}.\n(Redirecting to detailed profile...)`);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    OwnerApp.init();
});