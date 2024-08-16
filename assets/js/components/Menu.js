function getToken() {
  return localStorage.getItem("token");
}

const token = getToken();
if (!token) {
  console.error("No token found");

} else {

}

const decodedToken = jwt_decode(token);

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
fetch("http://localhost:8088/api/v1/admin/menu/all-menus", {
  method: "GET",
  headers: headers
})
.then((response) => response.json())
.then((data) => {

  const tableBody = document.querySelector("tbody"); // Select the table body
  tableBody.innerHTML = ""; // Clear the table

  // Separate active and inactive items
  const activeItems = data.filter(item => item.active);
  const inactiveItems = data.filter(item => !item.active);

  // Function to create table row
  function createRow(item) {
    const row = document.createElement("tr");
    row.setAttribute('draggable', 'true'); // Make row draggable
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
          <p class="text-xs text-secondary mb-0">${item.description}</p>
        </div>
      </div>
    `;
    row.appendChild(imgCell);

    // Add status cell
    const statusCell = document.createElement("td");
    statusCell.className = "align-middle text-center text-sm";
    statusCell.innerHTML = `
      <span class="badge badge-sm ${item.active ? "bg-gradient-success" : "bg-gradient-danger"}">${item.active ? "Active" : "Inactive"}</span>
    `;
    row.appendChild(statusCell);

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

  // Append active items first
  activeItems.forEach(item => {
    tableBody.appendChild(createRow(item));
  });

  // Append inactive items
  inactiveItems.forEach(item => {
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
        document.getElementById('descriptionInput').value = item.description;
        document.getElementById('imageTitle').textContent = item.imageUrl ? "Image Selected" : "No Image Selected";
        document.getElementById('selectedImage').src = item.imageUrl || "";
        document.getElementById('selectedImage').style.display = item.imageUrl ? 'block' : 'none';
        document.getElementById('imageUpload').dataset.itemId = item.id; // Store the item ID for saving later
        loadCategoriesEdit(item.id);
      }
    });
  });

  // Add click event listeners for delete links
  document.querySelectorAll('a[data-original-title="Delete"]').forEach(link => {
    link.addEventListener('click', (event) => {
      const id = event.target.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this menu?')) {
        deleteMenu(id);
      }
    });
  });

  // Add drag-and-drop functionality
  enableDragAndDrop();
})
.catch((error) => {
  console.error("Error fetching data:", error);
});
}

document.querySelector('button[type="submit"]').addEventListener('click', () => {
  const id = document.getElementById('imageUpload').dataset.itemId;
  const name = document.getElementById('nameInput').value;
  const description = document.getElementById('descriptionInput').value;
  const imageUrl = document.getElementById('selectedImage').src;

  if (id) {
    fetch(`http://localhost:8088/api/v1/admin/menu/edit-menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        name: name,
        description: description,
        imageUrl: imageUrl
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Update successful:", data);
      fetchData();
      document.getElementById('editRow').style.display = 'none';
      showToast(name+" Update Successful!")
    })
    .catch(error => {
      console.error("Error updating menu:", error);
    });
  }
});  

function deleteMenu(id) {
  fetch(`http://localhost:8088/api/v1/admin/menu/delete-menu/${id}`, {
      method: "DELETE",
      headers: headers
  })
  .then((response) => {
      if (!response.ok) {
          // Convert the response to JSON if possible
          return response.text().then((text) => {
              let errorMessage;
              try {
                  // Try to parse JSON response
                  const errorData = JSON.parse(text);
                  errorMessage = errorData.businessExceptionDescription || errorData.error;
              } catch (e) {
                  // Fallback in case the response isn't JSON
                  errorMessage = text;
              }
              throw new Error(errorMessage);
          });
      }
      return response.text();
  })
  .then((text) => {
      text = text.trim(); // Ensure trimming to avoid whitespace issues
      if (text === "Menu deleted successfully") {
          showToast('Menu deleted successfully!');
          fetchData(); 
      } else {
          showToast('An error occurred while deleting the menu.');
      }
  })
  .catch((error) => {
      showToast(error.message); // Show the error message
      console.error("Error deleting menu:", error);
  });
}

async function showToast(message) {
  const title = 'Menu Notification';
  const createdAt = new Date().toISOString(); 

  try {
    await fetch('http://localhost:8088/api/v1/admin/notification/create-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
       },
      body: JSON.stringify({
        title: title,
        content: message
      })
    });

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

function enableDragAndDrop() {
const rows = document.querySelectorAll('tbody tr');
let draggedRow = null;

rows.forEach(row => {
    row.setAttribute('draggable', true); // Satırların sürüklenebilir olduğunu belirtir.

    row.addEventListener('dragstart', (event) => {
        draggedRow = event.currentTarget;
        event.currentTarget.classList.add('dragging');
    });

    row.addEventListener('dragend', (event) => {
        event.currentTarget.classList.remove('dragging');
    });

    row.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    row.addEventListener('dragenter', (event) => {
        if (event.currentTarget.tagName === 'TR' && event.currentTarget !== draggedRow) {
            event.currentTarget.classList.add('over');
        }
    });

    row.addEventListener('dragleave', (event) => {
        event.currentTarget.classList.remove('over');
    });

    row.addEventListener('drop', (event) => {
        event.preventDefault();
        event.currentTarget.classList.remove('over');

        if (event.currentTarget.tagName === 'TR' && event.currentTarget !== draggedRow) {
            const tableBody = document.querySelector('tbody');
            
            // İlk satırı referans al
            const firstRow = tableBody.children[0];
            alert("emin misin")
            
            // Sürüklenen satırı en üst satır olarak yerleştir
            if (draggedRow !== firstRow) {
                tableBody.insertBefore(draggedRow, firstRow);
            }
            
            activateTopMenu(); // Sıralamayı backend'de güncellemek için fonksiyonu çağır.
        }
    });
});
}

function activateTopMenu() {
const rows = document.querySelectorAll('tbody tr');
const topRowId = rows[0].dataset.id; // En üst satırın ID'si

fetch(`http://localhost:8088/api/v1/admin/menu/activate-menu/${topRowId}`, {
    method: 'GET',
    headers: headers
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok.');
    }
    return response.json(); // Yanıtı JSON olarak döndür
})
.then(data => {
    if (data) {
        showToast('Menu activated successfully!');
        fetchData()
    } else {
        showToast('An error occurred while activating the menu.');
    }
})
.catch(error => {
    console.error("Error activating menu:", error);
    showToast('An error occurred while activating the menu.');
});
}

function createMenu() {
const name = document.getElementById('nameInput2').value;
const description = document.getElementById('descriptionInput2').value;
const imageUrl = document.getElementById('selectedImage2').src;

if (!name || !description) {
    alert('Please fill out all fields.');
    return;
}

const menu = {
    name: name,
    description: description,
    imageUrl: imageUrl
};

fetch('http://localhost:8088/api/v1/admin/menu/create-menu', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(menu)
})
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    showToast(name+" create successfully!")
    loadCategories(data.id);
    fetchData();
})
.catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    alert('Failed to create menu.');
});
}

document.addEventListener("DOMContentLoaded", () => {
document.getElementById("create-menu").addEventListener("click", createMenu);
});

function logOut() {
  localStorage.removeItem('token');
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("log-out").addEventListener("click", logOut);
});


function checkAuthentication() {
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

function loadCategories(menuId) {
  fetch('http://localhost:8088/api/v1/admin/category/categories', {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(categories => {
      return fetch(`http://localhost:8088/api/v1/admin/all-categories-for-menu/${menuId}`, {
          headers: {
              "Authorization": `Bearer ${token}`
          }
      }).then(response => response.json())
      .then(menusCategories => {
          const categoriesContainer = document.getElementById('categoriesContainer');
          if (!categoriesContainer) {
              throw new Error('Categories container edit element not found');
          }

          categoriesContainer.innerHTML = ''; 

          const selectedCategoryIds = new Set(menusCategories.map(cat => cat.categoryDto.id));

          categories.forEach(category => {
              const isCategorySelected = selectedCategoryIds.has(category.id);
              const categoryCard = document.createElement('div');
              categoryCard.className = 'card m-2 p-2';
              categoryCard.style.width = '150px';
              categoryCard.style.cursor = 'pointer';
              categoryCard.style.backgroundColor = isCategorySelected ? 'red' : 'green'; // Selected category is red, others are green
              categoryCard.style.color = 'white';

              if(!isCategorySelected) {
              categoryCard.innerHTML = `
              <div class="d-flex justify-content-between align-items-center">
                <span>${category.name}</span>
                <i class="material-icons" onclick="addCategoryToProduct(${category.id}, ${menuId}, this)">add</i>
              </div>
            `;
            categoriesContainer.appendChild(categoryCard);
      }
    
      if(isCategorySelected) {
        categoryCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <span>${category.name}</span>
          <i class="fa-solid fa-minus" onclick="deleteCategoryToProduct(${category.id}, ${menuId}, this)"></i>
        </div>
      `;
      categoriesContainer.appendChild(categoryCard);
}});
          document.getElementById('categoriesRow').style.display = 'flex';
      })
      .catch(error => console.error('Error fetching categories:', error));
  })
  .catch(error => console.error('Error:', error));
}

function loadCategoriesEdit(menuId) {

  fetch('http://localhost:8088/api/v1/admin/category/categories', {
      headers: {
          "Authorization": `Bearer ${token}`
      }
  })
  .then(response => response.json())
  .then(categories => {
      return fetch(`http://localhost:8088/api/v1/admin/all-categories-for-menu/${menuId}`, {
          headers: {
              "Authorization": `Bearer ${token}`
          }
      }).then(response => response.json())
      .then(menusCategories => {
          const categoriesContainer = document.getElementById('categoriesContainer2');
          if (!categoriesContainer) {
              throw new Error('Categories container edit element not found');
          }

          categoriesContainer.innerHTML = ''; 

          const selectedCategoryIds = new Set(menusCategories.map(cat => cat.categoryDto.id));

          categories.forEach(category => {
              const isCategorySelected = selectedCategoryIds.has(category.id);
              const categoryCard = document.createElement('div');
              categoryCard.className = 'card m-2 p-2';
              categoryCard.style.width = '150px';
              categoryCard.style.cursor = 'pointer';
              categoryCard.style.backgroundColor = isCategorySelected ? 'red' : 'green'; // Selected category is red, others are green
              categoryCard.style.color = 'white';

              if(!isCategorySelected) {
              categoryCard.innerHTML = `
              <div class="d-flex justify-content-between align-items-center">
                <span>${category.name}</span>
                <i class="material-icons" onclick="addCategoryToProduct(${category.id}, ${menuId}, this)">add</i>
              </div>
            `;
            categoriesContainer.appendChild(categoryCard);
      }
    
      if(isCategorySelected) {
        categoryCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <span>${category.name}</span>
          <i class="fa-solid fa-minus" onclick="deleteCategoryToProduct(${category.id}, ${menuId}, this)"></i>
        </div>
      `;
      categoriesContainer.appendChild(categoryCard);
}});
          document.getElementById('categoriesRow2').style.display = 'flex';
      })
      .catch(error => console.error('Error fetching categories:', error));
  })
  .catch(error => console.error('Error:', error));
}

function addCategoryToProduct(categoryId, menuId, element) {

  fetch(`http://localhost:8088/api/v1/admin/add-category/${menuId}?categoryId=${categoryId}`, {
      method: 'POST',
      headers: {
          "Authorization": `Bearer ${token}`
      }
  })  
  .then(response => {
      if (response.ok) {
          showToast("Category added to product");

          const categoryCard = element.closest('.card');
          if (categoryCard) {
              categoryCard.style.backgroundColor = 'red';
              categoryCard.style.color = 'white';
          }
      } else {
          console.error(`Error adding category ${categoryId} to product`);
      }
      loadCategoriesEdit(menuId);
      loadCategories(menuId);
  })
  .catch(error => console.error('Error:', error));
}

function deleteCategoryToProduct(categoryId, menuId, element) {

fetch(`http://localhost:8088/api/v1/admin/delete-category/${menuId}?categoryId=${categoryId}`, {
  method: 'DELETE',
  headers: {
        "Authorization": `Bearer ${token}`
    }
})  
.then(response => {
    if (response.ok) {
        showToast("Category deleted to product");

        const categoryCard = element.closest('.card');
        if (categoryCard) {
            categoryCard.style.backgroundColor = 'green';
            categoryCard.style.color = 'white';
        }
    } else {
        console.error(`Error deleting category ${categoryId} to product`);
    }
    loadCategoriesEdit(menuId);
    loadCategories(menuId);
})
.catch(error => console.error('Error:', error));
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

fetchData();