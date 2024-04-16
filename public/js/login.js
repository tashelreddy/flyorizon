
    function validateForm() {
        var username = document.getElementById("username").value;
        var password = document.getElementById("password").value;

        if (username === "" || password === "") {
            alert("Username and password are required.");
            return false;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return false;
        }

       
        if (!isValidEmail(username)) {
            alert("Please enter a valid email address.");
            return false;
        }
        return true;
    }

    function isValidEmail(email) {
        // Regular expression for basic email format validation
        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }

