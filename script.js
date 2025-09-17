// Google Translate Integration
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}

// Form handling and validation
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('esolForm');
    const todaysDateInput = document.getElementById('todaysDate');
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    todaysDateInput.value = today;
    
    // Phone number formatting
    function formatPhoneNumber(input) {
        input.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length >= 6) {
                value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
            } else if (value.length >= 3) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
            this.value = value;
        });
    }
    
    formatPhoneNumber(document.getElementById('telephone'));
    formatPhoneNumber(document.getElementById('emergencyContactPhone'));
    
    // Form submission
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
        submitBtn.textContent = 'Submitting...';
        form.classList.add('loading');
        
        // Hide previous messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        try {
            const formData = collectFormData();
            const success = await submitToGoogleSheets(formData);
            
            if (success) {
                successMessage.style.display = 'block';
                form.reset();
                todaysDateInput.value = today;
                
                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            errorMessage.style.display = 'block';
            errorMessage.scrollIntoView({ behavior: 'smooth' });
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
            form.classList.remove('loading');
        }
    });
    
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            } else {
                field.style.borderColor = '#28a745';
            }
        });
        
        // Validate email format
        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField.value && !emailRegex.test(emailField.value)) {
            emailField.style.borderColor = '#dc3545';
            isValid = false;
        }
        
        // Validate phone number format
        const phoneFields = [document.getElementById('telephone'), document.getElementById('emergencyContactPhone')];
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        phoneFields.forEach(field => {
            if (field.value && !phoneRegex.test(field.value)) {
                field.style.borderColor = '#dc3545';
                isValid = false;
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields correctly.');
        }
        
        return isValid;
    }
    
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Combine first and last name for full name (for backwards compatibility if needed)
        if (data.firstName && data.lastName) {
            data.fullName = data.firstName + ' ' + data.lastName;
        }
        
        // Add timestamp
        data.submissionTimestamp = new Date().toISOString();
        
        return data;
    }
    
    async function submitToGoogleSheets(data) {
        // Google Sheets Web App URL
        const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyN7iPd_T6Zpl8DnfvNBfqwdfv4LdKMPhcdlHrP_X8gXnBrkkppOEJ7C43ZnNafubQd/exec';
        
        try {
            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'no-cors'
            });
            
            // With no-cors mode, we can't read the response, so assume success
            return true;
        } catch (error) {
            console.error('Error submitting to Google Sheets:', error);
            return false;
        }
    }
});

// Utility function to handle form reset
function resetForm() {
    const form = document.getElementById('esolForm');
    const todaysDateInput = document.getElementById('todaysDate');
    
    form.reset();
    
    // Reset today's date
    const today = new Date().toISOString().split('T')[0];
    todaysDateInput.value = today;
    
    // Reset field borders
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.borderColor = '#ddd';
    });
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        googleTranslateElementInit,
        resetForm
    };
}