// ==========================================================================
// CORE LOGIC (Form Validation, API Submission & Mobile Menu)
// ==========================================================================

// We wrap everything in a 'DOMContentLoaded' event listener. 
// This ensures the JavaScript waits until the HTML file is fully read and loaded by the browser. 
// If we didn't do this, JS might try to look for an ID like 'myContactForm' before it exists, causing an error.
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. CONTACT FORM VALIDATION & SUBMISSION ---
    
    // Grab the main form element from the DOM using its ID. Using highly descriptive naming 
    // like 'userContactFormElement' makes it instantly clear what data type this variable holds.
    const userContactFormElement = document.getElementById('myContactForm');
    
    // We wrap our logic in an 'if' statement to ensure the form actually exists on this page.
    if (userContactFormElement) {
        
        // Listen for the 'submit' event, which fires when the user clicks the submit button.
        userContactFormElement.addEventListener('submit', function(formSubmissionEvent) {
            
            // Critical step: preventDefault() stops the browser's default behavior, 
            // which is to refresh the whole webpage when a form is submitted.
            formSubmissionEvent.preventDefault(); 
    
            // Grabbing the actual input DOM elements where the user types their information
            const userNameInputField = document.getElementById('name');
            const userEmailInputField = document.getElementById('email');
            const userMessageInputField = document.getElementById('message');
            
            // Grabbing the span elements below the inputs where we will display specific error text
            const userNameErrorElement = document.getElementById('nameErrorMessage');
            const userEmailErrorElement = document.getElementById('emailErrorMessage');
            const userMessageErrorElement = document.getElementById('messageErrorMessage');

            // Grabbing the container below the button for final success/failure messages
            const formStatusMessageElement = document.getElementById('formStatusMessage');
            
            // Grabbing the text inside the submit button so we can change it to "SENDING..." during the process
            const submitButtonTextElement = userContactFormElement.querySelector('.button-text');
            // Store the original "SUBMIT" text so we can revert it back later
            const originalSubmitButtonText = submitButtonTextElement.innerText;
    
            // ==========================================
            // HELPER FUNCTION: Reset Errors
            // ==========================================
            // Before we validate, we need to wipe away any old error messages from previous submit attempts.
            function clearAllErrorMessages() {
                // Loop through an array of the error text spans
                [userNameErrorElement, userEmailErrorElement, userMessageErrorElement].forEach(errorElement => {
                    errorElement.innerText = ""; // Clear the text
                    errorElement.classList.remove('show'); // Remove the CSS class that makes it visible
                });

                // Loop through the input boxes to remove the red borders
                [userNameInputField, userEmailInputField, userMessageInputField].forEach(inputElement => {
                    inputElement.style.border = "2px solid transparent";
                });

                // Clear the final status message at the bottom
                formStatusMessageElement.innerText = "";
                formStatusMessageElement.className = "form-status-message"; // Reset to default class
            }

            // ==========================================
            // HELPER FUNCTION: Trigger Specific Error
            // ==========================================
            // If validation fails, this function handles the visual updates to alert the user.
            function displayInputError(inputElement, errorElement, errorMessageText) {
                // Paint the border of the input box red
                inputElement.style.border = "2px solid #d63031"; 
                // Inject the specific error text into the DOM
                errorElement.innerText = errorMessageText;
                // Add the 'show' class to fade the text in via CSS
                errorElement.classList.add('show');

                // Smoothly scroll the page so the problematic input box is in the center of the screen
                inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Automatically click the cursor into the problem input box
                inputElement.focus();
            }

            // Execute the cleanup before checking the fields
            clearAllErrorMessages();
            
            // We use a boolean flag (true/false) to track if the form is good to go.
            let isFormValid = true;
    
            // ==========================================
            // VALIDATION CHECKS
            // ==========================================
            // .trim() removes accidental blank spaces. If it's empty, the user typed nothing.
            if (userNameInputField.value.trim() === "") {
                displayInputError(userNameInputField, userNameErrorElement, "Please enter your name.");
                isFormValid = false; // Flag that validation has failed
            } 
            // Check if email is empty, OR if it's missing the '@' symbol
            else if (userEmailInputField.value.trim() === "" || !userEmailInputField.value.includes('@')) {
                displayInputError(userEmailInputField, userEmailErrorElement, "Please enter a valid email address.");
                isFormValid = false;
            } 
            // Check if the message box is empty
            else if (userMessageInputField.value.trim() === "") {
                displayInputError(userMessageInputField, userMessageErrorElement, "Please enter a message.");
                isFormValid = false;
            }
    
            // If the flag was set to false by any of the checks above, we 'return'.
            // Returning stops the rest of the function dead in its tracks. The API call never happens.
            if (!isFormValid) {
                return; 
            }
    
            // ==========================================
            // API SUBMISSION (Validation Passed)
            // ==========================================
            
            // Give the user visual feedback that the network request is happening
            submitButtonTextElement.innerText = "SENDING";
            
            // FormData is a built-in JS object that automatically extracts the names and values from our inputs
            const formSubmissionDataObject = new FormData(userContactFormElement);

            // The 'fetch' API sends data over the network to the specified URL.
            fetch("https://api.web3forms.com/submit", {
                method: "POST", // We are posting data to the server
                body: formSubmissionDataObject // This is the payload containing the user's input
            })
            // .then() runs when the server responds back to us
            .then(async (apiResponse) => {
                // We await the parsing of the server's response into a readable JSON object
                let jsonResponseData = await apiResponse.json();
                
                // HTTP Status 200 means OK/Success
                if (apiResponse.status === 200) {
                    // Update the status message div to show success
                    formStatusMessageElement.innerText = "Your message has been sent.";
                    formStatusMessageElement.classList.add('success'); // Turns text green
                    userContactFormElement.reset(); // Empties all the input fields
                } else {
                    // If status is not 200, display the specific error the server gave us
                    formStatusMessageElement.innerText = "Error: " + jsonResponseData.message;
                    formStatusMessageElement.classList.add('error'); // Turns text red
                }
            })
            // .catch() only runs if the fetch completely fails (e.g., the user lost Wi-Fi)
            .catch((networkError) => {
                formStatusMessageElement.innerText = "Oops! Please check your internet connection.";
                formStatusMessageElement.classList.add('error');
                console.error(networkError); // Logs the technical error to the console for debugging
            })
            // .finally() ALWAYS runs at the very end, whether the fetch succeeded or failed
            .finally(() => {
                // Change the button text from "SENDING..." back to "SUBMIT"
                submitButtonTextElement.innerText = originalSubmitButtonText;
            });
        });
    }
    
    // --- 2. MOBILE MENU HANDLING ---
    
    // Select all the clickable navigation links
    const navigationLinkElements = document.querySelectorAll('.navigation-link');
    // Select the hidden HTML checkbox that CSS uses to toggle the mobile dropdown
    const mobileMenuCheckboxElement = document.getElementById('menu-toggle');
    
    // Ensure the elements exist on the page to prevent null reference errors
    if (mobileMenuCheckboxElement && navigationLinkElements.length > 0) {
        
        // Loop through every single nav link
        navigationLinkElements.forEach(singleLinkElement => {
            
            // Add a click listener to each link
            singleLinkElement.addEventListener('click', () => {
                // When a link is clicked, uncheck the hidden checkbox.
                // Because our CSS is watching this checkbox, unchecking it automatically closes the mobile menu.
                mobileMenuCheckboxElement.checked = false;
            });
        });
    }
});