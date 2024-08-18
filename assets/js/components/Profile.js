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
        const response = await fetch('http://localhost:8088/api/v1/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                password: newPassword
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

    const selectedImage = document.getElementById("selectedImage");
    if (imageUrl) {
      selectedImage.src = imageUrl;
      selectedImage.style.display = 'block'; 
    } else {
      selectedImage.style.display = 'none'; 
    }

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

  const selectedImageElement = document.getElementById('selectedImage');
  let imageUrl = selectedImageElement.src;

  if (!imageUrl || imageUrl === "data:,") {
    console.log(imageUrl);
    const pageHeaderElement = document.getElementById('page-header');
    let backgroundImage = getComputedStyle(pageHeaderElement).backgroundImage;
    imageUrl = backgroundImage
  }

  const restaurantData = {
      name: document.getElementById('new-restaurant-name').value,
      address: document.getElementById('new-restaurant-address').value,
      phone: document.getElementById('new-restaurant-phone').value,
      email: document.getElementById('new-restaurant-email').value,
      imageUrl: imageUrl
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

async function fetchDropDownNotifications() {
  try {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${token}`);
    headers.append("Content-Type", "application/json");

    const response = await fetch('http://localhost:8088/api/v1/admin/notification/all-notifications', {
      method: 'GET',
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let notifications = await response.json();

    // Sort notifications by date, most recent first
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Select the three most recent notifications
    const recentNotifications = notifications.slice(0, 3);

    const container = document.querySelector('.dropdown-menu');
    container.innerHTML = ''; // Clear any existing notifications

    recentNotifications.forEach(notification => {
      const li = document.createElement('li');
      li.classList.add('mb-2');

      let imgsource = '../assets/img/default_icon.png';
      if (notification.title.toLowerCase().includes('menu')) {
        imgsource = '../assets/img/menu_icon.png';
      } else if (notification.title.toLowerCase().includes('category')) {
        imgsource = '../assets/img/category_icon.jpeg';
      } else if (notification.title.toLowerCase().includes('product')) {
        imgsource = '../assets/img/product_icon.png';
      } else if (notification.title.toLowerCase().includes('profile')) {
        imgsource = '../assets/img/profile_icon.png';
      }

      let icon = `<img src="${imgsource}" class="avatar avatar-sm me-3">`;
      if (notification.title.toLowerCase().includes('album')) {
        icon = `<img src="../assets/img/small-logos/logo-spotify.svg" class="avatar avatar-sm bg-gradient-dark me-3">`;
      } else if (notification.title.toLowerCase().includes('payment')) {
        icon = `<div class="avatar avatar-sm bg-gradient-secondary me-3 my-auto">
                  <svg width="12px" height="12px" viewBox="0 0 43 36" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <title>credit-card</title>
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g transform="translate(-2169.000000, -745.000000)" fill="#FFFFFF" fill-rule="nonzero">
                        <g transform="translate(1716.000000, 291.000000)">
                          <g transform="translate(453.000000, 454.000000)">
                            <path class="color-background" d="M43,10.7482083 L43,3.58333333 C43,1.60354167 41.3964583,0 39.4166667,0 L3.58333333,0 C1.60354167,0 0,1.60354167 0,3.58333333 L0,10.7482083 L43,10.7482083 Z" opacity="0.593633743"></path>
                            <path class="color-background" d="M0,16.125 L0,32.25 C0,34.2297917 1.60354167,35.8333333 3.58333333,35.8333333 L39.4166667,35.8333333 C41.3964583,35.8333333 43,34.2297917 43,32.25 L43,16.125 L0,16.125 Z M19.7083333,26.875 L7.16666667,26.875 L7.16666667,23.2916667 L19.7083333,23.2916667 L19.7083333,26.875 Z M35.8333333,26.875 L28.6666667,26.875 L28.6666667,23.2916667 L35.8333333,23.2916667 L35.8333333,26.875 Z"></path>
                          </g>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>`;
      }

      li.innerHTML = `
        <a class="dropdown-item border-radius-md" href="javascript:;">
          <div class="d-flex py-1">
            <div class="my-auto">
              ${icon}
            </div>
            <div class="d-flex flex-column justify-content-center">
              <h6 class="text-sm font-weight-normal mb-1">
                <span class="font-weight-bold">${notification.title}</span>
              </h6>
              <div class="d-flex justify-content-between">
                <p class="text-xs text-secondary mb-0">${notification.content}</p>
              </div>
              <small>${new Date(notification.createdAt).toLocaleString()}</small>
            </div>
          </div>
        </a>
      `;

      container.appendChild(li);
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
}

document.addEventListener('DOMContentLoaded', fetchDropDownNotifications);