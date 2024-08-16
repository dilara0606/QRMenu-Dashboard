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

function injectStyles() {
    const style = `
    <style>
        .drag-handle {
            cursor: move;
            text-align: center;
        }
        .dragging {
            opacity: 0.5;
        }
        .over {
            border: 2px dashed #000;
        }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', style);
  }
  
  function fetchData() {
  fetch("http://localhost:8088/api/v1/admin/category/categories", {
    method: "GET",
    headers: headers
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Data:", data);
  
    const tableBody = document.querySelector("tbody"); // Select the table body
    tableBody.innerHTML = ""; // Clear the table
  
    // Function to create table row
    function createRow(item) {
      const row = document.createElement("tr");
      row.dataset.id = item.id; // Store item ID in row for later use

          // Add drag handle cell
    const dragHandleCell = document.createElement("td");
    dragHandleCell.className = "drag-handle";
    dragHandleCell.innerHTML = `<i class="fas fa-grip-vertical"></i>`;
    row.appendChild(dragHandleCell);

    // Add image cell
    const imgCell = document.createElement("td");
    imgCell.innerHTML = `
      <div class="d-flex px-2 py-1">
        <div>
          <img src="${item.imageUrl}" class="avatar avatar-lg me-3 border-radius-lg" alt="${item.name}">
        </div>
        <div class="d-flex flex-column justify-content-center">
          <h6 class="mb-0 text-sm">${item.name}</h6>
        </div>
      </div>
    `;
    row.appendChild(imgCell);
  
      // Add date cell
      const dateCell = document.createElement("td");
      dateCell.className = "align-middle text-center";
      dateCell.innerHTML = `
        <span class="text-secondary text-xs font-weight-bold">${item.updatedAt}</span>
      `;
      row.appendChild(dateCell);
  
      // Add edit cell
      const actionCellEdit = document.createElement("td");
      actionCellEdit.className = "align-middle";
      actionCellEdit.innerHTML = `
        <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit" data-id="${item.id}">
          Edit
        </a>
      `;
      row.appendChild(actionCellEdit);
  
      // Add delete cell
      const actionCellDelete = document.createElement("td");
      actionCellDelete.className = "align-middle";
      actionCellDelete.innerHTML = `
        <a href="javascript:;" class="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Delete" data-id="${item.id}">
          Delete
        </a>
      `;
      row.appendChild(actionCellDelete);
  
      return row;
    }

    data.forEach(item => {
        tableBody.appendChild(createRow(item));
      });
  
    // Add click event listeners for edit links
    document.querySelectorAll('a[data-original-title="Edit"]').forEach(link => {
      link.addEventListener('click', (event) => {
        document.getElementById('editRow').style.display = 'block';
        const id = event.target.getAttribute('data-id');
        const item = data.find(d => d.id == id); // Find the item with the matching ID
        if (item) {
          // Fill in the form with the item data
          document.getElementById('nameInput').value = item.name;
          document.getElementById('imageTitle').textContent = item.imageUrl ? "Image Selected" : "No Image Selected";
          document.getElementById('selectedImage').src = item.imageUrl || "";
          document.getElementById('selectedImage').style.display = item.imageUrl ? 'block' : 'none';
          document.getElementById('imageUpload').dataset.itemId = item.id; // Store the item ID for saving later
  
          console.log(item.imageUrl);
        }
      });
    });
  
    // Add click event listeners for delete links
    document.querySelectorAll('a[data-original-title="Delete"]').forEach(link => {
      link.addEventListener('click', (event) => {
        const id = event.target.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this category?')) {
          deleteCategory(id);
        }
      });
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
  }
  
  document.querySelector('button[type="submit"]').addEventListener('click', () => {
    const id = document.getElementById('imageUpload').dataset.itemId;
    const name = document.getElementById('nameInput').value;
    const imageUrl = document.getElementById('selectedImage').src;
  
    if (id) {
      fetch(`http://localhost:8088/api/v1/admin/category/edit-category/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          imageUrl: imageUrl
        })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Update successful:", data);
        fetchData();
        document.getElementById('editRow').style.display = 'none';
        showToast("Category "+name+" Update Successful!") 
      })
      .catch(error => {
        console.error("Error updating category:", error);
      });
    }
  });  
  
  function deleteCategory(id) {
    fetch(`http://localhost:8088/api/v1/admin/category/delete-category/${id}`, {
        method: "DELETE",
        headers: headers
    })
    .then((response) => response.text()) // Get response as text
    .then((text) => {
        console.log("Deletion Result:", text);
        if (text.trim() === "Category deleted successfully") { // Check the response
            showToast('Category deleted successfully!');
            fetchData(); 
        } else {
            showToast('An error occurred while deleting the category.');
        }
    })
    .catch((error) => {
        console.error("Error deleting category:", error);
        showToast('An error occurred while deleting the category.');
    });
  }
  
  async function showToast(message) {
    const title = 'Category Notification'; 
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
  
  function createCategory() {
  const name = document.getElementById('nameInput2').value;
  const imageUrl = document.getElementById('selectedImage2').src;
  
  if (!name) {
      alert('Please fill out all fields.');
      return;
  }
  
  const category = {
      name: name,
      imageUrl: imageUrl
  };
  
  fetch('http://localhost:8088/api/v1/admin/category/create-category', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.text();
  })
  .then(data => {
      showToast("Category "+name+ " create successfully!")
      fetchData();
  })
  .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      alert('Failed to create category.');
  });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("create-category").addEventListener("click", createCategory);
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

fetchData();