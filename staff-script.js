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

// Global variable to store student data
let studentsData = [];

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
    
    // Load students when page loads
    loadRegisteredStudents();
    
    // Handle student selection
    const studentSelect = document.getElementById('studentSelect');
    studentSelect.addEventListener('change', function() {
        // Student information is now handled automatically through the dropdown selection
        // No need to populate separate fields since they were removed
    });
    
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
        submitBtn.textContent = 'Submitting Assessment...';
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
            submitBtn.textContent = 'Submit Assessment & Class Level';
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
    
    // Get selected student information from the dropdown
    const studentSelect = document.getElementById('studentSelect');
    const selectedStudentName = studentSelect.value;
    
    if (selectedStudentName) {
        const selectedStudent = studentsData.find(student => 
            student.firstName + ' ' + student.lastName === selectedStudentName
        );
        
        if (selectedStudent) {
            data.studentFirstName = selectedStudent.firstName;
            data.studentLastName = selectedStudent.lastName;
            data.studentEmail = selectedStudent.email;
        }
    }
    
    // Add assignment timestamp
    data.assignmentTimestamp = new Date().toISOString();
    
    return data;
}

async function submitClassAssignment(data) {
    // This will connect to your Google Sheets Web App URL
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxOIUstNipURSNSN3LRJ0fyjA783COwlP6cWUiKznaoKAvoP5hYF_bjD1h-Uqr9I-Y/exec';
    
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

// Function to load registered students
async function loadRegisteredStudents() {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxOIUstNipURSNSN3LRJ0fyjA783COwlP6cWUiKznaoKAvoP5hYF_bjD1h-Uqr9I-Y/exec';
    const studentSelect = document.getElementById('studentSelect');
    
    studentSelect.innerHTML = '<option value="">Loading registered students...</option>';
    
    try {
        // Try using JSONP approach instead of fetch
        const script = document.createElement('script');
        const callbackName = 'studentsCallback_' + Date.now();
        
        // Create global callback function
        window[callbackName] = function(data) {
            if (data && data.success && data.students && Array.isArray(data.students)) {
                studentsData = data.students;
                populateStudentDropdown();
            } else {
                studentSelect.innerHTML = '<option value="">No students found in registration</option>';
            }
            
            // Clean up
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
        };
        
        // Use JSONP approach
        script.src = GOOGLE_SHEETS_URL + '?action=getStudents&callback=' + callbackName;
        
        script.onerror = function() {
            studentSelect.innerHTML = '<option value="">Error loading students - check connection</option>';
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
            delete window[callbackName];
        };
        
        document.head.appendChild(script);
        
        // Fallback timeout
        setTimeout(() => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
                delete window[callbackName];
                tryDirectFetch();
            }
        }, 10000);
        
    } catch (error) {
        console.error('Error in loadRegisteredStudents:', error);
        studentSelect.innerHTML = '<option value="">Error loading students - please refresh</option>';
    }
}

// Fallback function to try direct fetch
async function tryDirectFetch() {
    const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxOIUstNipURSNSN3LRJ0fyjA783COwlP6cWUiKznaoKAvoP5hYF_bjD1h-Uqr9I-Y/exec';
    const studentSelect = document.getElementById('studentSelect');
    
    try {
        const response = await fetch(GOOGLE_SHEETS_URL + '?action=getStudents');
        
        if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.students && Array.isArray(result.students)) {
                studentsData = result.students;
                populateStudentDropdown();
            } else {
                studentSelect.innerHTML = '<option value="">No students found in registration</option>';
            }
        } else {
            studentSelect.innerHTML = '<option value="">Error: Could not connect to database</option>';
        }
    } catch (error) {
        console.error('Direct fetch error:', error);
        studentSelect.innerHTML = '<option value="">Network error - please check connection</option>';
    }
}

// Function to populate the student dropdown
function populateStudentDropdown() {
    const studentSelect = document.getElementById('studentSelect');
    
    if (studentsData.length === 0) {
        studentSelect.innerHTML = '<option value="">No registered students found</option>';
        return;
    }
    
    // Sort students alphabetically by last name, then first name
    studentsData.sort((a, b) => {
        const aName = (a.lastName || '') + ', ' + (a.firstName || '');
        const bName = (b.lastName || '') + ', ' + (b.firstName || '');
        return aName.localeCompare(bName);
    });
    
    // Clear existing options
    studentSelect.innerHTML = '<option value="">Select a student...</option>';
    
    // Add students to dropdown
    studentsData.forEach(student => {
        const option = document.createElement('option');
        const fullName = student.firstName + ' ' + student.lastName;
        option.value = fullName;
        option.textContent = `${student.lastName}, ${student.firstName}${student.email ? ' (' + student.email + ')' : ''}`;
        studentSelect.appendChild(option);
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkPassword,
        logout,
        validateForm,
        collectFormData
    };
}