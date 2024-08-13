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
  
  // Save button event listener
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
        showToast("Category Update Successful!") // Refresh the table with updated data
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
  
  function showToast(message) {
    const toastEl = document.getElementById('successToast');
    const toastBody = toastEl.querySelector('.toast-body');
    const toastHeaderSpan = toastEl.querySelector('.toast-header .me-auto');
    const toastHeaderSmall = toastEl.querySelector('.toast-header small');
  
    toastBody.textContent = message;
    toastHeaderSpan.textContent = 'Notification'; // Customize as needed
    toastHeaderSmall.textContent = 'Just now'; // Customize as needed
  
    // Show the toast
    const toast = new bootstrap.Toast(toastEl, {
        delay: 4000 // 3 seconds
    });
    toast.show();
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
      showToast("Category create successfully!")
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

fetchData();