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
  fetch("http://localhost:8088/api/v1/admin/item/all-item", {
    method: "GET",
    headers: headers
  })
  .then((response) => response.json())
  .then((data) => {
    updateTable(data);
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
    const price = document.getElementById('priceInput').value;
    
  
    if (id) {
      fetch(`http://localhost:8088/api/v1/admin/item/edit-item/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name,
          description: description,
          price: price,
          imageUrl: imageUrl,
         
        })
      })
      .then(response => response.json())
      .then(data => {
        fetchData();
        document.getElementById('editRow').style.display = 'none';
        showToast("Product "+name+" Update Successful!")
      })
      .catch(error => {
        console.error("Error updating product:", error);
      });
    }
  });  
  
  function deleteProduct(id) {
    fetch(`http://localhost:8088/api/v1/admin/item/delete-item/${id}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
           "Authorization": `Bearer ${token}`
      },
    })
    .then((response) => response.text()) // Get response as text
    .then((text) => {
        if (text.trim() === "Category deleted successfully") { // Check the response
            showToast('Product deleted successfully!');
            fetchData(); 
        } else {
            showToast('An error occurred while deleting the product.');
        }
    })
    .catch((error) => {
        console.error("Error deleting product:", error);
        showToast('An error occurred while deleting the product.');
    });
  }
  
  async function showToast(message) {
    const title = 'Product Notification'; 
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
  
  function createProduct() {
    const name = document.getElementById('nameInput2').value;
    const description = document.getElementById('descriptionInput2').value;
    const imageUrl = document.getElementById('selectedImage2').src;
    const price = document.getElementById('priceInput2').value;
    
    if (!name || !description) {
      alert('Please fill out all fields.');
      return;
    }
    
    const product = {
      name: name,
      description: description,
      price: price,
      imageUrl: imageUrl
    };
    
    fetch('http://localhost:8088/api/v1/admin/item/create-item', {
      method: 'POST',
     headers: {
          'Content-Type': 'application/json',
           "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(product)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      showToast("Product "+name+" created successfully!");
      loadCategories(data.id);
      fetchData();
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      alert('Failed to create product.');
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("create-product").addEventListener("click", createProduct);
  });
  
  function toggleCreateRow() {
    var editRowProduct = document.getElementById('editRowProduct');
    editRowProduct.style.display = editRowProduct.style.display === 'none' ? 'block' : 'none';
  }
  
  function previewImage2(event) {
    var reader = new FileReader();
    reader.onload = function() {
      var output = document.getElementById('selectedImage2');
      output.src = reader.result;
      output.style.display = 'block';
    }
    reader.readAsDataURL(event.target.files[0]);
    document.getElementById('imageTitle2').innerText = event.target.files[0].name;
  }
  
  function loadCategories(productId) {
    fetch('http://localhost:8088/api/v1/admin/category/categories', {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(categories => {
        return fetch(`http://localhost:8088/api/v1/admin/all-categories/${productId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(response => response.json())
        .then(productCategories => {
            const categoriesContainer = document.getElementById('categoriesContainer');
            if (!categoriesContainer) {
                throw new Error('Categories container edit element not found');
            }
  
            categoriesContainer.innerHTML = ''; 
  
            const selectedCategoryIds = new Set(productCategories.map(cat => cat.categoryDto.id));
  
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
                  <i class="material-icons" onclick="addCategoryToProduct(${category.id}, ${productId}, this)">add</i>
                </div>
              `;
              categoriesContainer.appendChild(categoryCard);
        }
      
        if(isCategorySelected) {
          categoryCard.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <span>${category.name}</span>
            <i class="fa-solid fa-minus" onclick="deleteCategoryToProduct(${category.id}, ${productId}, this)"></i>
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
  
  function loadCategoriesEdit(productId) {
  
    fetch('http://localhost:8088/api/v1/admin/category/categories', {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(categories => {
        return fetch(`http://localhost:8088/api/v1/admin/all-categories/${productId}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        }).then(response => response.json())
        .then(productCategories => {
            const categoriesContainer = document.getElementById('categoriesContainer2');
            if (!categoriesContainer) {
                throw new Error('Categories container edit element not found');
            }
  
            categoriesContainer.innerHTML = ''; 
  
            const selectedCategoryIds = new Set(productCategories.map(cat => cat.categoryDto.id));
  
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
                  <i class="material-icons" onclick="addCategoryToProduct(${category.id}, ${productId}, this)">add</i>
                </div>
              `;
              categoriesContainer.appendChild(categoryCard);
        }
      
        if(isCategorySelected) {
          categoryCard.innerHTML = `
          <div class="d-flex justify-content-between align-items-center">
            <span>${category.name}</span>
            <i class="fa-solid fa-minus" onclick="deleteCategoryToProduct(${category.id}, ${productId}, this)"></i>
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

function addCategoryToProduct(categoryId, productId, element) {

    fetch(`http://localhost:8088/api/v1/admin/add-item/${categoryId}?itemId=${productId}`, {
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
        loadCategoriesEdit(productId);
        loadCategories(productId);
    })
    .catch(error => console.error('Error:', error));
}

function deleteCategoryToProduct(categoryId, productId, element) {

  fetch(`http://localhost:8088/api/v1/admin/delete-item/${categoryId}?itemId=${productId}`, {
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
      loadCategoriesEdit(productId);
      loadCategories(productId);
  })
  .catch(error => console.error('Error:', error));
}

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
  
  let timeout = null;

  async function searchItems() {
      const searchInput = document.getElementById('searchInput').value;

      const requestBody = {
          name: searchInput,
          description: searchInput
      };

      try {
          const response = await fetch('http://localhost:8088/api/v1/admin/item/search-item', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(requestBody)
          });

          const data = await response.json();
          updateTable(data); // Update table with new data

      } catch (error) {
          console.error('Error:', error);
      }
  }

  function handleInput() {
      clearTimeout(timeout);
      timeout = setTimeout(searchItems, 300);
  }

  function updateTable(data) {
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
            <p class="text-xs text-secondary mb-0">${item.description}</p>
          </div>
        </div>
      `;
      row.appendChild(imgCell);
  
      // Add Prices cell
      const PriceCell = document.createElement("td");
      PriceCell.className = "align-middle text-center text-sm";
      PriceCell.innerHTML = `
         <span class="badge badge-sm bg-gradient-secondary">${item.price} ₺</span>
      `;
      
      row.appendChild(PriceCell);
  
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
          document.getElementById('priceInput').value = item.price;
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
        if (confirm('Are you sure you want to delete this product?')) {
          deleteProduct(id);
        }
      });
    });
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