function showSuccessMessage(message) {
    const successMessage = document.createElement("div");
    successMessage.textContent = message;
    successMessage.style.position = "fixed";
    successMessage.style.bottom = "10px";
    successMessage.style.right = "10px";
    successMessage.style.backgroundColor = "green";
    successMessage.style.color = "white";
    successMessage.style.padding = "10px";
    successMessage.style.borderRadius = "5px";
    successMessage.style.zIndex = "9999";
    document.body.appendChild(successMessage);
    setTimeout(function () {
      successMessage.remove();
    }, 10000);
  }
  
  function showErrorMessage(message) {
    const successMessage = document.createElement("div");
    successMessage.textContent = message;
    successMessage.style.position = "fixed";
    successMessage.style.bottom = "10px";
    successMessage.style.right = "10px";
    successMessage.style.backgroundColor = "red";
    successMessage.style.color = "white";
    successMessage.style.padding = "10px";
    successMessage.style.borderRadius = "5px";
    successMessage.style.zIndex = "9999";
    document.body.appendChild(successMessage);
    setTimeout(function () {
      successMessage.remove();
    }, 10000);
  }

function saveToken(token) {
    localStorage.setItem('token', token); 
    console.log(token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

function decodeToken(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
    }

    const payload = JSON.parse(atob(tokenParts[1]));

    return payload;
}

function handleLogin(data) {
    console.log(data);

    const decodedToken = decodeToken(data.token);
    saveToken(data.token);

    const roles = decodedToken.authorities;

    if (roles.includes('DOCTOR')) {
        window.location.href = 'doctor.html'; 
    } else if (roles.includes('ADMIN')) {
        window.location.href = 'admin/admin.html'; 
    } else {
        window.location.href = '../pages/dashboard.html'; 
    }
}

function handleError(error) {
    console.error('Error:', error);
    var generalError = document.getElementById('general-error');
    generalError.textContent = error.message || 'An error occurred.';
    generalError.style.color = 'red';
    generalError.style.display = 'block';
}

var button = document.getElementById('sign-in');

button.onclick = function () {
    var emailInput = document.getElementById('email');
    var passwordInput = document.getElementById('password');
    var emailError = document.getElementById('email-error');
    var passwordError = document.getElementById('password-error');
    var generalError = document.getElementById('general-error');

    var email = emailInput.value.trim();
    var password = passwordInput.value.trim();

    emailError.textContent = '';
    passwordError.textContent = '';
    generalError.textContent = '';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    generalError.style.display = 'none';

    var hasError = false;

    if (!email) {
        emailError.textContent = 'Email cannot be empty.';
        emailError.style.display = 'block';
        hasError = true;
    }

    if (!password) {
        passwordError.textContent = 'Password cannot be empty.';
        passwordError.style.display = 'block';
        hasError = true;
    }

    if (hasError) {
        emailInput.value = '';
        passwordInput.value = '';
        return;
    }

    fetch("http://localhost:8088/api/v1/auth/authenticate", {
        mode: 'cors',
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json"
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Email / password incorrect! Please try again.');
        }
        return response.json();
    })
    .then(data => {
        handleLogin(data);
        console.log(data);
    })
    .catch((error) => {
        handleError(error);
    });
};

function register() {

    console.log("Register")
    const userName = document.getElementById('userName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch("http://localhost:8088/api/v1/auth/register", {
        mode: 'cors',
        method: "POST",
        body: JSON.stringify({
             username : userName,
             email : email,
             password : password
            }),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Email / password incorrect! Please try again.');
        }
        window.location.href = '../pages/activate.html';
        return response.json();
    })
    .then(data => {
        handleLogin(data);

    })
    .catch((error) => {
        handleError(error);
    });
};

function moveToNext(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        const nextField = document.getElementById(nextFieldID);
        if (nextField) {
            nextField.focus();
        }
    }
}

function moveToPrev(event, prevFieldID) {
    if (event.key === 'Backspace' && event.target.value === '') {
        const prevField = document.getElementById(prevFieldID);
        if (prevField) {
            prevField.focus();
        }
    }
}

function activateAccount() {
    const code = [
        document.getElementById('code1').value,
        document.getElementById('code2').value,
        document.getElementById('code3').value,
        document.getElementById('code4').value,
        document.getElementById('code5').value,
        document.getElementById('code6').value
    ].join('');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:8088/api/v1/auth/activate-account?token=${code}`, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showSuccessMessage("Activate success!");
                window.location.href = 'http://127.0.0.1:5500/pages/sign-in.html'; 
            } else {
                showErrorMessage("Activation failed!");
            }
        }
    };
    xhr.send();
}

 function toggleButton () {
    const passwordField = document.getElementById('password');
    const type = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = type;

};
