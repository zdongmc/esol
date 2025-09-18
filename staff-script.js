// Staff password (change this to your desired password)
const STAFF_PASSWORD = "ESOL2024";

// Check password function
function checkPassword() {
    const enteredPassword = document.getElementById('staffPassword').value;
    const passwordError = document.getElementById('passwordError');
    
    if (enteredPassword === STAFF_PASSWORD) {
        // Hide password screen and show staff form
        document.getElementById('passwordScreen').style.display = 'none';
        document.getElementById('staffForm').style.display = 'block';
        passwordError.style.display = 'none';
    } else {
        // Show error message
        passwordError.style.display = 'block';
        document.getElementById('staffPassword').value = '';
        document.getElementById('staffPassword').focus();
    }
}

// Logout function
function logout() {
    // Hide staff form and show password screen
    document.getElementById('staffForm').style.display = 'none';
    document.getElementById('passwordScreen').style.display = 'flex';
    
    // Reset forms
    document.getElementById('classAssignmentForm').reset();
    document.getElementById('staffPassword').value = '';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

// Allow Enter key to submit password
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('staffPassword');
    
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });
    
    // Focus on password field when page loads
    passwordInput.focus();
    
    // Form submission handling
    const form = document.getElementById('classAssignmentForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        const submitBtn = document.querySelector('.submit-btn');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Assigning Student...';
        form.classList.add('loading');
        
        // Hide previous messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            const formData = collectFormData();
            const success = await submitClassAssignment(formData);
            
            if (success) {
                successMessage.style.display = 'block';
                form.reset();
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('Assignment failed');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth' });
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Assign Student to Class';
            form.classList.remove('loading');
        }
    });
});

function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            field.style.borderColor = '#28a745';
        }
    });
    
    // Validate email format if provided
    const emailField = document.getElementById('studentEmail');
    if (emailField.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value)) {
            emailField.style.borderColor = '#dc3545';
            isValid = false;
        }
    }
    
    if (!isValid) {
        alert('Please fill in all required fields correctly.');
    }
    
    return isValid;
}

function collectFormData() {
    const formData = new FormData(document.getElementById('classAssignmentForm'));
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Add assignment timestamp
    data.assignmentTimestamp = new Date().toISOString();
    
    return data;
}

async function submitClassAssignment(data) {
    // This will connect to your Google Sheets Web App URL
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyN7iPd_T6Zpl8DnfvNBfqwdfv4LdKMPhcdlHrP_X8gXnBrkkppOEJ7C43ZnNafubQd/exec';
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                type: 'classAssignment',
                data: data
            }),
            mode: 'no-cors'
        });
        
        // With no-cors mode, we can't read the response, so assume success
        return true;
    } catch (error) {
        console.error('Error submitting class assignment:', error);
        return false;
    }
}

// Auto-fill today's date for start date
document.addEventListener('DOMContentLoaded', function() {
    const startDateInput = document.getElementById('startDate');
    const today = new Date().toISOString().split('T')[0];
    startDateInput.value = today;
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkPassword,
        logout,
        validateForm,
        collectFormData
    };
}