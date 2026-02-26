// ==========================================================================
// CORE LOGIC (Form Validation, API Submission, Notifications & Mobile Menu)
// ==========================================================================

// 'DOMContentLoaded' ensures the HTML is fully parsed before running this logic.
// This prevents errors where JS tries to select an element that hasn't loaded yet.
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. NOTIFICATION SYSTEM ---
    // Grabbing the toast container and the text span inside it from the DOM.
    const notificationToastElement = document.getElementById('notificationToast');
    const notificationMessageElement = document.getElementById('notificationMessage');

    // Helper function to display the toast notification
    function displayNotificationToast(messageText, notificationType) {
        // Set the text content of the notification
        notificationMessageElement.innerText = messageText;
        
        // Reset classes to default, then add the specific type (success or error) and the 'show' class to animate it in
        notificationToastElement.className = 'notification-toast'; 
        notificationToastElement.classList.add(notificationType);
        notificationToastElement.classList.add('show');

        // Automatically hide the toast after 4 seconds (4000 milliseconds)
        setTimeout(() => {
            notificationToastElement.classList.remove('show');
        }, 4000);
    }

    // --- 2. CONTACT FORM VALIDATION & SUBMISSION ---
    // Grabbing the form element by its ID
    const userContactFormElement = document.getElementById('myContactForm');
    
    // Check if the form actually exists on the page to prevent null errors
    if (userContactFormElement) {
        
        // Listen for the 'submit' event (when the user clicks the submit button)
        userContactFormElement.addEventListener('submit', function(submissionEvent) {
            
            // Prevent the default browser behavior, which is to refresh the page on form submission
            submissionEvent.preventDefault(); 
    
            // Grab the input fields by their IDs
            const userNameInputField = document.getElementById('name');
            const userEmailInputField = document.getElementById('email');
            const userMessageInputField = document.getElementById('message');
            
            // Grab the text span inside the submit button so we can change it to "SENDING..." later
            const submitButtonTextElement = userContactFormElement.querySelector('.button-text');
            // Store the original text ("SUBMIT") so we can change it back after the process finishes
            const originalButtonText = submitButtonTextElement.innerText;
    
            // Helper function to draw a red border around empty/invalid inputs
            function highlightInputError(inputElement) {
                inputElement.style.border = "2px solid #d63031"; // Red border
                // Smoothly scroll the screen so the user can clearly see the problematic input
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Automatically click into the input field
                inputElement.focus();
    
                // Remove the red border after 3 seconds
                setTimeout(() => {
                    inputElement.style.border = "2px solid transparent";
                }, 3000);
            }
    
            // Validation Checks: Name
            // .trim() removes extra spaces. If the result is empty, it means the user typed nothing or just spaces.
            if (userNameInputField.value.trim() === "") {
                highlightInputError(userNameInputField);
                displayNotificationToast("Please enter your name.", "error");
                return; // Stop the execution here, don't submit the form
            }
    
            // Validation Checks: Email (checks if empty OR if it's missing an '@' symbol)
            if (userEmailInputField.value.trim() === "" || !userEmailInputField.value.includes('@')) {
                highlightInputError(userEmailInputField);
                displayNotificationToast("Please enter a valid email address.", "error");
                return; // Stop execution
            }
    
            // Validation Checks: Message
            if (userMessageInputField.value.trim() === "") {
                highlightInputError(userMessageInputField);
                displayNotificationToast("Please enter a message.", "error");
                return; // Stop execution
            }
    
            // API Submission Logic (If all validation passes)
            
            // Change button text to give user feedback that something is happening
            submitButtonTextElement.innerText = "SENDING...";
            
            // FormData automatically collects all the input names and values from the form
            const formSubmissionDataObject = new FormData(userContactFormElement);

            // Fetch API is used to make a network request to Web3Forms
            fetch("https://api.web3forms.com/submit", {
                method: "POST", // Sending data out
                body: formSubmissionDataObject // The data being sent
            })
            .then(async (apiResponse) => {
                // Parse the response from the server into a readable JSON object
                let jsonResponseData = await apiResponse.json();
                
                // Status 200 means HTTP OK (Success)
                if (apiResponse.status === 200) {
                    displayNotificationToast("Your message has been sent.", "success");
                    userContactFormElement.reset(); // Clear out the form fields
                } else {
                    // If the server rejected it for some reason, show the error message provided by the API
                    displayNotificationToast("Error: " + jsonResponseData.message, "error");
                }
            })
            .catch((networkError) => {
                // This block runs if the fetch fails completely (e.g., user lost internet connection)
                displayNotificationToast("Oops! Please check your internet connection.", "error");
                console.error(networkError);
            })
            .finally(() => {
                // The 'finally' block runs regardless of success or error.
                // We use this to change the button text back to normal.
                submitButtonTextElement.innerText = originalButtonText;
            });
        });
    }
    
    // --- 3. MOBILE MENU HANDLING ---
    // Select all the navigation links
    const navigationLinkElements = document.querySelectorAll('.navigation-link');
    // Select the hidden checkbox that controls the mobile menu visibility
    const mobileMenuCheckboxElement = document.getElementById('menu-toggle');
    
    // Make sure elements exist before adding logic
    if (mobileMenuCheckboxElement && navigationLinkElements.length > 0) {
        
        // Loop through each navigation link
        navigationLinkElements.forEach(singleLinkElement => {
            
            // When a link is clicked, uncheck the hidden checkbox.
            // This causes the CSS to automatically collapse the mobile menu.
            singleLinkElement.addEventListener('click', () => {
                mobileMenuCheckboxElement.checked = false;
            });
        });
    }
});