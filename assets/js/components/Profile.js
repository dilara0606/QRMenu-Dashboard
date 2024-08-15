function getToken() {
    return localStorage.getItem("token");
  }

  const token = getToken();

  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`); 

  let restaurantId = null;

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
    const token = getToken();
    if (!token) {
        window.location.href = 'http://127.0.0.1:5500/pages/sign-in.html';
    }
  }
  
  window.onload = function() {
    checkAuthentication();
    history.pushState(null, null, location.href);
  };
  
  window.onpopstate = function(event) {
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
            showToast('Password updated successfully');
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
    
    let name = ""; 
    let surname = "";
    
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
            showToast('Profile updated successfully');
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('An error occurred while updating the profile');
    }
});

function fetchRestaurantInfo() {
  if (!token) {
    console.error("No token found");
    return;
  }

  fetch("http://localhost:8088/api/v1/admin/restaurant/info", {
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
    const restaurant = data[0];
    restaurantId = restaurant.id;
    document.getElementById("restaurant-name").textContent = restaurant.name || "Not Available";
    document.getElementById("restaurant-phone").textContent = restaurant.phone || "Not Available";
    document.getElementById("restaurant-email").textContent = restaurant.email || "Not Available";
    document.getElementById("restaurant-address").textContent = restaurant.address || "Not Available";

    const imageUrl = restaurant.imageUrl;
    const pageHeader = document.getElementById("page-header");
    pageHeader.style.backgroundImage = `url('${imageUrl}')`;

  })
  .catch(error => {
    console.error("Error fetching user info:", error);
  });
}

document.addEventListener("DOMContentLoaded", fetchRestaurantInfo);

document.getElementById('edit-restaurant-btn').addEventListener('click', () => {
  const editRestaurantModal = new bootstrap.Modal(document.getElementById('editRestaurantModal'));
  editRestaurantModal.show();    

  document.getElementById('new-restaurant-name').value = document.getElementById('restaurant-name').innerText;
  document.getElementById('new-restaurant-address').value = document.getElementById('restaurant-address').innerText;
  document.getElementById('new-restaurant-phone').value = document.getElementById('restaurant-phone').innerText;
  document.getElementById('new-restaurant-email').value = document.getElementById('restaurant-email').innerText;
});

document.getElementById('restaurant-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!token) {
      alert('No token found');
      return;
  }

  const restaurantData = {
      name: document.getElementById('new-restaurant-name').value,
      address: document.getElementById('new-restaurant-address').value,
      phone: document.getElementById('new-restaurant-phone').value,
      email: document.getElementById('new-restaurant-email').value,
  };

  try {
      const id = restaurantId;
      const response = await fetch(`http://localhost:8088/api/v1/admin/restaurant/edit-restaurant/${id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(restaurantData)
      });

      if (response.ok) {
          const data = await response.json();
          console.log('Restaurant updated successfully:', data);
          const editRestaurantModal = bootstrap.Modal.getInstance(document.getElementById('editRestaurantModal'));
          editRestaurantModal.hide();
          fetchRestaurantInfo();
          showToast("Restaurant updated successfully")
      } else {
          const error = await response.text();
          alert(`Error: ${error}`);
      }
  } catch (error) {
      console.error('Fetch error:', error);
      alert('An error occurred while updating the restaurant');
  }
});

async function showToast(message) {
  const title = 'Profile Notification'; 
  const createdAt = new Date().toISOString();

  try {
    // Save notification to the database
    await fetch('http://localhost:8088/api/v1/admin/notification/create-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
       },
      body: JSON.stringify({
        title: title,
        content: message,
      })
    });

    // Display the toast
    const toastEl = document.getElementById('successToast');
    const toastBody = toastEl.querySelector('.toast-body');
    const toastHeaderSpan = toastEl.querySelector('.toast-header .me-auto');
    const toastHeaderSmall = toastEl.querySelector('.toast-header small');

    toastBody.textContent = message;
    toastHeaderSpan.textContent = title;
    toastHeaderSmall.textContent = createdAt;

    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
  } catch (error) {
    console.error('Error saving or showing toast:', error);
  }
}