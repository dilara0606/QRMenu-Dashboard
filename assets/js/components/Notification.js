function getToken() {
    return localStorage.getItem("token");
  }
  
  const token = getToken();
  if (!token) {
    console.error("No token found");
  
  } else {
  
  }
  
  const decodedToken = jwt_decode(token);
  console.log("Decoded Token:", decodedToken);
  
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`); 

  async function fetchNotifications() {
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
  
      const notifications = await response.json();
  
      // Sort notifications by date in descending order (newest first)
      notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      const container = document.getElementById('notifications-container');
      container.innerHTML = ''; // Clear any existing notifications
  
      notifications.forEach(notification => {
        const alertDiv = document.createElement('div');
  
        // Determine the alert class based on the title
        let alertClass = 'alert-danger';
        if (notification.title.toLowerCase().includes('menu')) {
          alertClass = 'alert-danger';
        } else if (notification.title.toLowerCase().includes('category')) {
          alertClass = 'alert-success';
        } else if (notification.title.toLowerCase().includes('product')) {
          alertClass = 'alert-warning';
        } else if (notification.title.toLowerCase().includes('profile')) {
          alertClass = 'alert-info';
        }
  
        alertDiv.className = `alert ${alertClass} alert-dismissible text-white`;
        alertDiv.setAttribute('role', 'alert');
  
        // Format the createdAt date
        const notificationDate = new Date(notification.createdAt).toLocaleString();
  
        alertDiv.innerHTML = `
          <strong>${notification.title}</strong>
          <div class="d-flex justify-content-between">
            <p class="mb-1">${notification.content}</p>
            <small>${notificationDate}</small>
          </div>
          <button type="button" class="btn-close text-lg py-3 opacity-10" data-bs-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        `;
  
        container.appendChild(alertDiv);
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }  

  document.addEventListener('DOMContentLoaded', fetchNotifications);
  
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
  
        // Determine the icon based on the notification title or type
        let icon = `<img src="../assets/img/team-2.jpg" class="avatar avatar-sm me-3 ">`;
        if (notification.title.toLowerCase().includes('album')) {
          icon = `<img src="../assets/img/small-logos/logo-spotify.svg" class="avatar avatar-sm bg-gradient-dark me-3 ">`;
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
                  <small>${new Date(notification.createdAt).toLocaleString()}</small>
                </div>
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
  
  document.addEventListener('DOMContentLoaded', fetchNotifications);
  document.addEventListener('DOMContentLoaded', fetchDropDownNotifications);
  