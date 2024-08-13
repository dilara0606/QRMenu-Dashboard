function getToken() {
    return localStorage.getItem("token");
}

const token = getToken();

function setSize(size) {
    const iframe = document.getElementById('livePreview');
    switch(size) {
        case 'phone':
            iframe.style.width = '430px';
            iframe.style.height = '932px';
            break;
        case 'tablet':
            iframe.style.width = '768px';
            iframe.style.height = '1024px';
            break;
        case 'desktop':
            iframe.style.width = '100%';
            iframe.style.height = '600px';
            break;
    }
}

function setCustomSize() {
    const iframe = document.getElementById('livePreview');
    const width = document.getElementById('widthInput').value;
    const height = document.getElementById('heightInput').value;
    if (width && height) {
      iframe.style.width = width + 'px';
      iframe.style.height = height + 'px';
    }
  }

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