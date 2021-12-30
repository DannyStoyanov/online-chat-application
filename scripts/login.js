var storage = window.localStorage;

const signUpFormElement = document.getElementById('sign-up-form');
const signUpButtonElement = document.getElementById('sign-up-button');
const signUpUsernameElement = document.getElementById('sign-up-username');
const signUpEmailElement = document.getElementById('sign-up-email');
const signUpPasswordElement = document.getElementById('sign-up-password');
const signUpConfPassElement = document.getElementById('sign-up-conf-pass');

const loginFormElement = document.getElementById('login-form');
const loginButtonElement = document.getElementById('login-button');
const loginEmailElement = document.getElementById('login-email');
const loginPasswordElement = document.getElementById('login-password');

window.addEventListener('load', (event) => {
    // signUpFormElement.classList.add("hidden");
});

// Sign up functionality

function existingSignUpgEmailAddress() {
    const signUpEmail = signUpEmailElement.value.trim();
    if (storage.getItem(`${signUpEmail}`) === null) {
        return false;
    }
    return true;
}

function checkUsername() {
    const inputUsername = signUpUsernameElement.value.trim();
    if (inputUsername === '') {
        setErrorFor(signUpUsernameElement, 'Username cannot be blank');
    }
    else {
        setSuccessFor(signUpUsernameElement);
    }
}

// Regex email checking function
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function checkEmail() {
    const inputEmail = signUpEmailElement.value.trim();
    if ((validateEmail(inputEmail) === false) || (inputEmail === '')) {
        setErrorFor(signUpEmailElement, 'Email address is not valid');
    }
    else {
        if (existingSignUpgEmailAddress() === true) {
            setErrorFor(signUpEmailElement, 'This email address is already used');
        }
        else {
            setSuccessFor(signUpEmailElement);
        }
    }
}

function checkPassword() {
    const inputPassword = signUpPasswordElement.value.trim();
    if (inputPassword.length < 6) {
        setErrorFor(signUpPasswordElement, 'Password cannot be less than 6 characters');
    }
    else {
        setSuccessFor(signUpPasswordElement);
    }
}

function checkConfPass() {
    const inputPassword = signUpPasswordElement.value.trim();
    const inputConfPass = signUpConfPassElement.value.trim();
    if (inputPassword !== inputConfPass) {
        setErrorFor(signUpConfPassElement, 'Passwords do not match');
    }
    else {
        setSuccessFor(signUpConfPassElement);
    }
}

function checkSignUpInputs() {
    checkUsername();
    checkEmail();
    checkPassword();
    checkConfPass();
}

function setErrorFor(input, message) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag
    // adding message inside small
    small.innerHTML = `${message}`;

    // add error class and remove success class
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

function setSuccessFor(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag
    small.innerHTML = '';

    // add success class and remove error class
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

function setNeutral(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag
    small.innerHTML = '';
    
    inputControl.classList.remove('success');
    inputControl.classList.remove('error');
}

signUpUsernameElement.addEventListener('change', event => {
    event.preventDefault();
    checkUsername();
});

signUpEmailElement.addEventListener('change', event => {
    event.preventDefault();
    checkEmail();
});

signUpPasswordElement.addEventListener('change', event => {
    event.preventDefault();
    if (signUpPasswordElement.value.trim() != '') {
        if (signUpConfPassElement.value !== '') {
            checkConfPass();
        }
    }
    checkPassword();
});

signUpConfPassElement.addEventListener('change', event => {
    event.preventDefault();
    checkConfPass();
});

function successInputControl() {
    const inputControlList = document.getElementById('sign-up-user-info').querySelectorAll('.input-control');
    var counter = 0;
    for (let index = 0; index < inputControlList.length; index++) {
        if (inputControlList[index].classList.contains('success') === true) {
            counter++;
        }
    }
    return counter === inputControlList.length;
}

signUpButtonElement.addEventListener('click', event => {
    event.preventDefault();
    if (successInputControl() === true) {
        signUpFormElement.submit();
        const username = signUpUsernameElement.value.trim();
        const email = signUpEmailElement.value.trim();
        const password = signUpPasswordElement.value.trim();
        storage.setItem(email, JSON.stringify([username, email, password]));
        signUpUsernameElement.value = '';
        signUpEmailElement.value = '';
        signUpPasswordElement.value = '';
        signUpConfPassElement.value = '';
    }
    else {
        checkSignUpInputs();
    }
});

// Login functionality

function existingLoginEmailAddress() {
    const loginEmail = loginEmailElement.value.trim();
    if (storage.getItem(`${loginEmail}`)) {
        return true;
    }
    return false;
}

function checkEmailAndPass() {
    const inputEmail = loginEmailElement.value.trim();
    const inputPassword = loginPasswordElement.value.trim();
    const data = JSON.parse(storage.getItem(`${inputEmail}`));
    if ((data[1] === inputEmail) && (data[2] === inputPassword)) {
        return true;
    }
    return false;
}

loginButtonElement.addEventListener("click", event => {
    event.preventDefault();
    if (existingLoginEmailAddress() === true) {
        setSuccessFor(loginEmailElement);
        if (checkEmailAndPass() === true) {
            loginFormElement.submit();
            storage.setItem('current-user', JSON.stringify(loginEmailElement.value.trim()));
            loginEmailElement.value = '';
            loginPasswordElement.value = '';
        }
        else {
            setErrorFor(loginPasswordElement, 'Incorrect password');
        }
    }
    else {
        loginPasswordElement.value = '';
        setNeutral(loginPasswordElement);
        setErrorFor(loginEmailElement, 'Incorrect email address');
    }
});