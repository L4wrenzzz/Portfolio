// CONTACT FORM VALIDATION + MOBILE MENU HANDLING

// Get the form element using its ID from HTML
const form = document.getElementById('myContactForm');

// Add an event listener that runs when the form is submitted
form.addEventListener('submit', function(event) {

    // Prevents the page from refreshing when submit is clicked
    event.preventDefault();

    // Get the input fields by their IDs
    const nameInput = document.getElementById('name');       // Name input field
    const emailInput = document.getElementById('email');     // Email input field
    const messageInput = document.getElementById('message'); // Message textarea field

    // Helper function to handle form errors
    function scrollToError(element) {
        // Change border color to red to show error visually
        element.style.border = "2px solid red";

        // Smoothly scroll the page so the element appears in the center
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Automatically put the typing cursor inside the input
        element.focus();

        // Remove the red border after 3 seconds
        setTimeout(() => {
            element.style.border = "2px solid transparent";
        }, 3000);
    }

    // FORM VALIDATION CHECKS

    // Check if the Name input is empty (after removing spaces)
    if (nameInput.value.trim() === "") {
        scrollToError(nameInput); // Show error and scroll to Name field
        return;                   // Stop form submission
    }

    // Check if the Email input is empty
    if (emailInput.value.trim() === "") {
        scrollToError(emailInput); // Show error and scroll to Email field
        return;
    }

    // Check if the Email contains '@' (basic email validation)
    if (!emailInput.value.includes('@')) {
        scrollToError(emailInput); // Show error if invalid email
        return;
    }

    // Check if the Message textarea is empty
    if (messageInput.value.trim() === "") {
        scrollToError(messageInput); // Show error and scroll to Message field
        return;
    }

    // If all checks pass, show success message
    alert("Message Sent! (Not really, this is just a demo hehe)");
});

// MOBILE MENU AUTO CLOSE WHEN CLICKING LINKS

// Select all navigation links (HOME, ABOUT, etc.)
const navigationLinks = document.querySelectorAll('.navigation-link');

// Get the hidden checkbox that controls the mobile menu
const menuCheckbox = document.getElementById('menu-toggle');

// Loop through each navigation link
navigationLinks.forEach(link => {

    // Add a click event listener to each link
    link.addEventListener('click', () => {

        // Uncheck the checkbox to close the mobile menu
        menuCheckbox.checked = false;

    });
});