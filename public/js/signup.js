$(document).ready(function() {
    $('#signupForm').submit(function(e) {
        e.preventDefault();
        
        var formData = {
            username: $('#username').val(),
            email: $('#email').val(),
            password: $('#password').val()
        };
        
        $.ajax({
            type: 'POST',
            url: '/signup',
            data: formData,
            success: function(response) {
                $('#response').html(response);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    var tripTypeSelect = document.getElementById('trip-type');
    var returnDateInput = document.getElementById('return-date').parentElement;

    tripTypeSelect.addEventListener('change', function() {
      if (tripTypeSelect.value === 'One Way') {
        returnDateInput.style.display = 'none';
      } else {
        returnDateInput.style.display = 'block';
      }
    });
  });
