function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`); 

  function fetchUserInfo() {
    if (!token) {
      console.error("No token found");
      return;
    }
  
    fetch("http://localhost:8088/api/v1/admin/user/info", {
      method: "GET",
      headers: headers
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); 
    })
    .then(data => {
      document.getElementById("full-name").textContent = data.name + " " + data.surname || "Not Available";
      document.getElementById("mobile").textContent = data.phone || "Not Available";
      document.getElementById("email").textContent = data.email || "Not Available";
      document.getElementById("location").textContent = data.location || "Not Available";
  
    })
    .catch(error => {
      console.error("Error fetching user info:", error);
    });
  }
  
document.addEventListener("DOMContentLoaded", fetchUserInfo);

document.getElementById("password-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    console.log("Password update logic goes here");
  });

function logOut() {
    localStorage.removeItem('token');
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("log-out").addEventListener("click", logOut);
  });

function checkAuthentication() {
  if (!token) {
      // window.location.href = 'http://127.0.0.1:5500/pages/sign-in.html'; 
      console.log('no authentication')
  }
}

window.onload = function() {
  checkAuthentication();
};

function togglePasswordVisibility(event) {
    const button = event.currentTarget; // Buton elementi
    const input = button.previousElementSibling; // İlgili input elemanı
    const icon = button.querySelector('i'); // Buton içindeki ikon

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Tüm butonlara olay işleyiciyi ekleyin
document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', togglePasswordVisibility);
});

document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('http://localhost:8088/api/v1/admin/user/update-password', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                newPassword : newPassword
               }),
        });

        if (response.ok) {
            alert('Password updated successfully');
            document.getElementById('password-form').reset();
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while updating the password');
    }
});

document.getElementById('edit-profile-btn').addEventListener('click', () => {
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    editProfileModal.show();

    
    const fullName = document.getElementById('full-name').innerText;
    const nameParts = fullName.split(" ");
    
    let name = ""; // `let` kullanın, çünkü değeri değişebilir
    let surname = ""; // `let` kullanın, çünkü değeri değişebilir
    
    if (nameParts.length > 1) {
        name = nameParts[0];
        surname = nameParts[1];
    } else {
        name = nameParts[0]; 
        surname = ""; 
    }    

    document.getElementById('new-name').value = name;
    document.getElementById('new-surname').value = surname;
    document.getElementById('new-email').value = document.getElementById('email').innerText;
    document.getElementById('new-phone').value = document.getElementById('mobile').innerText;
    document.getElementById('new-location').value = document.getElementById('location').innerText;
});

document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!token) {
        alert('No token found');
        return;
    }

    const profileData = {
        name: document.getElementById('new-name').value,
        surname: document.getElementById('new-surname').value,
        email: document.getElementById('new-email').value,
        phone: document.getElementById('new-phone').value,
        location: document.getElementById('new-location').value,
    };

    try {
        const response = await fetch('http://localhost:8088/api/v1/admin/user/update-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Profile updated successfully:', data);
            alert('Profile updated successfully');
            const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editProfileModal.hide();
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while updating the profile');
    }
});
