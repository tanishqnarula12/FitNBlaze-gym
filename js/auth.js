// auth.js - Custom Authentication Logic for Fit 'N' Blaze
// Requires supabase.js to be loaded first

/**
 * Authenticates a user using their custom Login ID and Phone Number.
 * This calls the custom PostgreSQL function `authenticate_user`.
 * 
 * @param {string} loginId - e.g., ADMIN001, TRN001, FNB001
 * @param {string} phone - e.g., 9876543210
 * @returns {Promise<Object>} - Success status and user data
 */
async function loginWithIdAndPhone(loginId, phone) {
    if (!window.db) {
        console.error("Supabase client not initialized.");
        return { success: false, message: "Database connection failed." };
    }

    try {
        // Force uppercase for login IDs (e.g. admin001 -> ADMIN001)
        const normalizedLoginId = loginId.toUpperCase();

        // ----------------------------------------------------
        // ADMIN BYPASS LOGIC (Requested by User)
        // ----------------------------------------------------
        if ((normalizedLoginId === 'ADMIN001' || normalizedLoginId === 'ADMIN') && phone === 'fitnblazeis01gym') {
            const adminUser = { 
                id: '10000000-0000-0000-0000-000000000001', 
                role: 'admin', 
                full_name: 'System Admin', 
                phone: 'fitnblazeis01gym', 
                login_id: normalizedLoginId 
            };
            localStorage.setItem('fnb_user', JSON.stringify(adminUser));
            return { success: true, user: adminUser };
        }
        // ----------------------------------------------------

        // Call the custom RPC (Remote Procedure Call) function in PostgreSQL
        const { data, error } = await window.db.rpc('authenticate_user', {
            p_login_id: normalizedLoginId,
            p_phone: phone
        });

        if (error) {
            console.error("Supabase RPC Error Details:", error);
            if (error.code === 'PGRST202') {
                return { success: false, message: "Database not configured yet. Please run the SQL scripts in Supabase." };
            }
            return { success: false, message: "Server error: " + error.message };
        }

        // data will be the JSON object returned by the PostgreSQL function
        if (data && data.success) {
            // Store user session in localStorage for this MVP
            localStorage.setItem('fnb_user', JSON.stringify(data.user));
            return { success: true, user: data.user };
        } else {
            return { success: false, message: data.message || "Invalid credentials." };
        }

    } catch (err) {
        console.error("Login exception:", err);
        return { success: false, message: "Network error occurred." };
    }
}

/**
 * Gets the currently logged-in user from local storage.
 * @returns {Object|null} - User object or null if not logged in
 */
function getCurrentUser() {
    const userData = localStorage.getItem('fnb_user');
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch(e) {
            return null;
        }
    }
    return null;
}

/**
 * Logs the user out by clearing local storage and redirecting to the login page.
 */
function logout() {
    localStorage.removeItem('fnb_user');
    window.location.href = '../auth/login.html'; // Adjust path depending on where it's called
}

/**
 * Redirects the user to their specific dashboard based on their role.
 * @param {string} role - 'admin', 'trainer', or 'member'
 */
function redirectBasedOnRole(role) {
    switch(role.toLowerCase()) {
        case 'admin':
            window.location.href = '../admin/dashboard.html';
            break;
        case 'trainer':
            window.location.href = '../trainer/dashboard.html';
            break;
        case 'member':
            window.location.href = '../member/dashboard.html';
            break;
        default:
            console.error("Unknown role:", role);
            alert("Invalid role assigned to this account.");
    }
}

/**
 * Middleware: Checks if a user is logged in and matches the required role.
 * Place this at the top of protected pages.
 * @param {string} requiredRole - The role required to view the page (optional)
 */
function requireAuth(requiredRole = null) {
    const user = getCurrentUser();
    
    if (!user) {
        // Not logged in
        window.location.href = '../auth/login.html';
        return;
    }

    if (requiredRole && user.role !== requiredRole) {
        // Logged in but wrong role (e.g. member trying to access admin dashboard)
        alert("Access Denied: You do not have permission to view this page.");
        redirectBasedOnRole(user.role);
    }
}

// Make functions globally available
window.auth = {
    loginWithIdAndPhone,
    getCurrentUser,
    logout,
    redirectBasedOnRole,
    requireAuth
};

// --- UI Interaction Logic for login.html ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const roleTabs = document.querySelectorAll('.role-tab');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = document.getElementById('loginBtn');
    
    // Check if we are on the login page
    if (!loginForm) return;

    // IF ALREADY LOGGED IN, REDIRECT TO DASHBOARD
    const currentUser = window.auth.getCurrentUser();
    if (currentUser) {
        window.auth.redirectBasedOnRole(currentUser.role);
        return; // Stop rendering login form
    }

    let currentRole = 'member';

    // Role Tab Switching
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.dataset.role;

            // Update Label
            const userIdLabel = document.getElementById('userIdLabel');
            if(currentRole === 'admin') userIdLabel.innerText = "Admin ID";
            else if(currentRole === 'trainer') userIdLabel.innerText = "Trainer ID";
            else userIdLabel.innerText = "Member ID";

            // Update placeholder
            const userIdInput = document.getElementById('userId');
            if(currentRole === 'admin') userIdInput.placeholder = "e.g. ADMIN001";
            else if(currentRole === 'trainer') userIdInput.placeholder = "e.g. TRN001";
            else userIdInput.placeholder = "e.g. FNB001";

            // Update Phone vs Password input based on role
            const phoneLabel = document.querySelector('label[for="userPhone"]');
            const phoneInput = document.getElementById('userPhone');
            const phoneIcon = phoneInput.previousElementSibling;

            if(currentRole === 'admin') {
                if(phoneLabel) phoneLabel.innerText = "Admin Password";
                phoneInput.type = "password";
                phoneInput.placeholder = "Enter Admin Password";
                phoneInput.removeAttribute('pattern');
                if(phoneIcon) {
                    phoneIcon.className = "fa-solid fa-lock input-icon";
                }
            } else {
                if(phoneLabel) phoneLabel.innerText = "Registered Phone Number";
                phoneInput.type = "tel";
                phoneInput.placeholder = "e.g. 9876543212";
                phoneInput.setAttribute('pattern', '[0-9]{10}');
                if(phoneIcon) {
                    phoneIcon.className = "fa-solid fa-phone input-icon";
                }
            }

            // Update Demo credentials view
            document.querySelectorAll('#demoCredentials li').forEach(li => {
                li.classList.remove('active');
                if(li.dataset.role === currentRole) li.classList.add('active');
            });
            
            // Clear error on switch
            if(errorMessage) {
                errorMessage.style.display = 'none';
                errorMessage.innerText = '';
            }
        });
    });

    // Close Demo box
    const closeDemoBtn = document.getElementById('closeDemoBtn');
    if(closeDemoBtn) {
        closeDemoBtn.addEventListener('click', () => {
            document.getElementById('demoCredentials').style.display = 'none';
        });
    }

    // Handle Form Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim();
        
        if(!userId || !userPhone) {
            showError("Please enter both ID and Phone Number.");
            return;
        }

        // Show loader
        if(loginBtn) loginBtn.classList.add('loading');
        if(errorMessage) errorMessage.style.display = 'none';

        // CALL SUPABASE AUTH
        const response = await window.auth.loginWithIdAndPhone(userId, userPhone);

        if(loginBtn) loginBtn.classList.remove('loading');

        if (response.success) {
            // Check if role matches selected tab
            if(response.user.role !== currentRole) {
                showError(`You are trying to log in as ${currentRole}, but your account is registered as ${response.user.role}.`);
                return;
            }
            
            // Success! Redirect to correct dashboard
            window.auth.redirectBasedOnRole(response.user.role);
        } else {
            // Show error message from Supabase/PostgreSQL
            showError(response.message || "Invalid credentials. Please try again.");
        }
    });

    function showError(msg) {
        if(errorMessage) {
            errorMessage.innerText = msg;
            errorMessage.style.display = 'block';
        } else {
            alert(msg);
        }
    }
});
