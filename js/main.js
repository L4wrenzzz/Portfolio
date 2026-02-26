// ==========================================================================
// CORE LOGIC (Form Validation, API Submission, Notifications & Mobile Menu)
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONTACT FORM VALIDATION & SUBMISSION ---
    const userContactFormElement = document.getElementById('myContactForm');
    
    if (userContactFormElement) {
        
        userContactFormElement.addEventListener('submit', function(formSubmissionEvent) {
            formSubmissionEvent.preventDefault(); 
    
            // Input Elements
            const userNameInputField = document.getElementById('name');
            const userEmailInputField = document.getElementById('email');
            const userMessageInputField = document.getElementById('message');
            
            // Error Message Span Elements
            const userNameErrorElement = document.getElementById('nameErrorMessage');
            const userEmailErrorElement = document.getElementById('emailErrorMessage');
            const userMessageErrorElement = document.getElementById('messageErrorMessage');

            // Status message at the bottom and the submit button
            const formStatusMessageElement = document.getElementById('formStatusMessage');
            const submitButtonTextElement = userContactFormElement.querySelector('.button-text');
            const originalSubmitButtonText = submitButtonTextElement.innerText;
    
            // Helper function to reset all visual errors before re-checking
            function clearAllErrorMessages() {
                // Clear the text and hide the error spans
                [userNameErrorElement, userEmailErrorElement, userMessageErrorElement].forEach(errorElement => {
                    errorElement.innerText = "";
                    errorElement.classList.remove('show');
                });

                // Remove red borders from inputs
                [userNameInputField, userEmailInputField, userMessageInputField].forEach(inputElement => {
                    inputElement.style.border = "2px solid transparent";
                });

                // Clear the main status message at the bottom
                formStatusMessageElement.innerText = "";
                formStatusMessageElement.className = "form-status-message";
            }

            // Helper function to highlight a specific input and show its inline error message
            function displayInputError(inputElement, errorElement, errorMessageText) {
                inputElement.style.border = "2px solid #d63031"; 
                errorElement.innerText = errorMessageText;
                errorElement.classList.add('show');

                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                inputElement.focus();
            }

            // Start fresh on every submit attempt
            clearAllErrorMessages();
            
            // We use a flag to track validation so we can check everything cleanly
            let isFormValid = true;
    
            // Validation Checks
            if (userNameInputField.value.trim() === "") {
                displayInputError(userNameInputField, userNameErrorElement, "Please enter your name.");
                isFormValid = false;
            } 
            else if (userEmailInputField.value.trim() === "" || !userEmailInputField.value.includes('@')) {
                displayInputError(userEmailInputField, userEmailErrorElement, "Please enter a valid email address.");
                isFormValid = false;
            } 
            else if (userMessageInputField.value.trim() === "") {
                displayInputError(userMessageInputField, userMessageErrorElement, "Please enter a message.");
                isFormValid = false;
            }
    
            // If any validation failed, stop here.
            if (!isFormValid) {
                return; 
            }
    
            // API Submission Logic (If all validation passes)
            submitButtonTextElement.innerText = "SENDING...";
            
            const formSubmissionDataObject = new FormData(userContactFormElement);

            fetch("https://api.web3forms.com/submit", {
                method: "POST", 
                body: formSubmissionDataObject 
            })
            .then(async (apiResponse) => {
                let jsonResponseData = await apiResponse.json();
                
                if (apiResponse.status === 200) {
                    // Display success message right below the submit button
                    formStatusMessageElement.innerText = "Awesome! Your message has been sent.";
                    formStatusMessageElement.classList.add('success');
                    userContactFormElement.reset(); 
                } else {
                    formStatusMessageElement.innerText = "Error: " + jsonResponseData.message;
                    formStatusMessageElement.classList.add('error');
                }
            })
            .catch((networkError) => {
                formStatusMessageElement.innerText = "Oops! Please check your internet connection.";
                formStatusMessageElement.classList.add('error');
                console.error(networkError);
            })
            .finally(() => {
                submitButtonTextElement.innerText = originalSubmitButtonText;
            });
        });
    }
    
    // --- 2. MOBILE MENU HANDLING ---
    const navigationLinkElements = document.querySelectorAll('.navigation-link');
    const mobileMenuCheckboxElement = document.getElementById('menu-toggle');
    
    if (mobileMenuCheckboxElement && navigationLinkElements.length > 0) {
        navigationLinkElements.forEach(singleLinkElement => {
            singleLinkElement.addEventListener('click', () => {
                mobileMenuCheckboxElement.checked = false;
            });
        });
    }
});