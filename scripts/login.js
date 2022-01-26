// Localstorage
var storage = window.localStorage;

// Sign up DOM elements
const signUpDivElement = document.getElementById('sign-up-form-wrapper');
const signUpFormElement = document.getElementById('sign-up-form');
const signUpButtonElement = document.getElementById('sign-up-button');
const signUpUsernameElement = document.getElementById('sign-up-username');
const signUpEmailElement = document.getElementById('sign-up-email');
const signUpPasswordElement = document.getElementById('sign-up-password');
const signUpConfPassElement = document.getElementById('sign-up-conf-pass');

// Login DOM elements
const loginDivElement = document.getElementById('login-form-wrapper');
const loginFormElement = document.getElementById('login-form');
const loginButtonElement = document.getElementById('login-button');
const loginEmailElement = document.getElementById('login-email');
const loginPasswordElement = document.getElementById('login-password');

// Default onload page state
window.addEventListener('load', (event) => {
    signUpDivElement.classList.add("hidden");

    // Setting inputs to default values
    signUpUsernameElement.value = '';
    signUpEmailElement.value = '';
    signUpPasswordElement.value = '';
    signUpConfPassElement.value = '';
    loginEmailElement.value = '';
    loginPasswordElement.value = '';
});

document.getElementById('to-sign-up-link').addEventListener('click', event => {
    loginDivElement.classList.add('hidden');
    signUpDivElement.classList.remove('hidden');
});

document.getElementById('to-login-link').addEventListener('click', event => {
    signUpDivElement.classList.add('hidden');
    loginDivElement.classList.remove('hidden');
});

// Sign up functionality

// Check for user with the same email address
function existingSignUpgEmailAddress() {
    const signUpEmail = signUpEmailElement.value.trim();
    if (storage.getItem(`${signUpEmail}`) === null) {
        return false; // not existing email
    }
    return true; // existing such email
}

// Username validation and visuals for correctness
function checkSignUpUsername() {
    const inputUsername = signUpUsernameElement.value.trim();
    if (inputUsername === '') {
        setErrorFor(signUpUsernameElement, 'Username cannot be blank'); // add error message and red styling for input
    }
    else {
        setSuccessFor(signUpUsernameElement); // add green styling for input
    }
}

// Regex email address checking function
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

// Email address validation and visuals for correctness
function checkSignUpEmail() {
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

// Password validation and visuals for correctness
function checkSignUpPassword() {
    const inputPassword = signUpPasswordElement.value.trim();
    if (inputPassword.length < 6) {
        setErrorFor(signUpPasswordElement, 'Password cannot be less than 6 characters');
    }
    else {
        setSuccessFor(signUpPasswordElement);
    }
}

// Confirm password validation and visuals for correctness
function checkSignUpConfPass() {
    const inputPassword = signUpPasswordElement.value.trim();
    const inputConfPass = signUpConfPassElement.value.trim();
    if (inputPassword !== inputConfPass) {
        setErrorFor(signUpConfPassElement, 'Passwords do not match');
    }
    else {
        setSuccessFor(signUpConfPassElement);
    }
}

// End-to-end validation
function checkSignUpInputs() {
    checkSignUpUsername();
    checkSignUpEmail();
    checkSignUpPassword();
    const inputControl = signUpPasswordElement.parentElement;
    if(inputControl.classList.contains("error")===true) {
        setErrorFor(signUpConfPassElement, 'Passwords do not match');
    }
    else {
        checkSignUpConfPass();
    }
    
}

// Display visual information for the given input in case denied validation - (add red styling)
function setErrorFor(input, message) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag

    // Add message inside small
    small.innerHTML = `${message}`;

    // Add error class and remove success class
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
}

// Display visual information for the given input in case of passed validation - (add green styling)
function setSuccessFor(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag

    // Remove error message
    small.innerHTML = '';

    // Add success class and remove error class
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
}

// Display default(onload) visual information for the given input (remove red/green styling)
function setNeutral(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector('small'); // small - tag

    // Remove error message
    small.innerHTML = '';
    
    inputControl.classList.remove('success'); // remove pass validation styling
    inputControl.classList.remove('error');   // remove denied validation styling
}

signUpUsernameElement.addEventListener('change', event => {
    event.preventDefault();
    checkSignUpUsername(); // validatation and style
});

signUpEmailElement.addEventListener('change', event => {
    event.preventDefault();
    checkSignUpEmail(); // validatation and style
});

signUpPasswordElement.addEventListener('change', event => {
    event.preventDefault();
    if (signUpPasswordElement.value.trim() != '') {
        if (signUpConfPassElement.value !== '') {
            checkSignUpConfPass(); // validatation and style
        }
    }
    checkSignUpPassword(); // validatation and style
});

signUpConfPassElement.addEventListener('change', event => {
    event.preventDefault();
    checkSignUpConfPass(); // validatation and style
});

// Loop through inputs to check for errors
function successInputControl() {
    const inputControlList = document.getElementById('sign-up-user-info').querySelectorAll('.input-control'); // divs
    var counter = 0;
    for (let index = 0; index < inputControlList.length; index++) {
        if (inputControlList[index].classList.contains('success') === true) {
            counter++;
        }
    }
    return counter === inputControlList.length; // check number of successful validations
}

// Sign up validation and submition
signUpButtonElement.addEventListener('click', event => {
    event.preventDefault();
    if (successInputControl() === true) {
        signUpFormElement.submit();
        const username = signUpUsernameElement.value.trim();
        const email = signUpEmailElement.value.trim();
        const password = signUpPasswordElement.value.trim();
        storage.setItem(email, JSON.stringify([username, email, password]));
        
        // Setting inputs to default values
        signUpUsernameElement.value = '';
        signUpEmailElement.value = '';
        signUpPasswordElement.value = '';
        signUpConfPassElement.value = '';
        window.location.href='./main.html';
    }
    else {
        checkSignUpInputs();
    }
});

// Login functionality

// Check for user with the same email address
function existingLogingEmailAddress() {
    const loginEmail = loginEmailElement.value.trim();
    if (storage.getItem(`${loginEmail}`) === null) {
        return false; // not existing email
    }
    return true; // existing such email
}

function checkLoginEmail() {
    const inputEmail = loginEmailElement.value.trim();
    if ((validateEmail(inputEmail) === false) || (inputEmail === '')) {
        setErrorFor(loginEmailElement, 'Incorrect email address');
    }
    else {
        if (existingLogingEmailAddress() === false) {
            setErrorFor(loginEmailElement, 'Email address is not registered');
        }
        else {
            setSuccessFor(loginEmailElement);
        }
    }
}

loginEmailElement.addEventListener('change', event => {
    event.preventDefault();
    checkLoginEmail(); // validatation and style
});

// Validate email uniquesness
function existingLoginEmailAddress() {
    const loginEmail = loginEmailElement.value.trim();
    if (storage.getItem(`${loginEmail}`)) {
        return true; // existing such email
    }
    return false; // not existing email
}

// Check localstorage's records for matching email address and password
function checkEmailAndPass() { 
    // NOTE: Check for existing email address before using!
    const inputEmail = loginEmailElement.value.trim();
    const inputPassword = loginPasswordElement.value.trim();
    const data = JSON.parse(storage.getItem(`${inputEmail}`));
    if ((data[1] === inputEmail) && (data[2] === inputPassword)) {
        return true;
    }
    return false;
}

// Login validation and submition
loginButtonElement.addEventListener("click", event => {
    event.preventDefault();
    if (existingLoginEmailAddress() === true) {
        setSuccessFor(loginEmailElement);
        if (checkEmailAndPass() === true) {
            loginFormElement.submit();
            storage.setItem('current-user', JSON.stringify(loginEmailElement.value.trim()));
            loginEmailElement.value = '';
            loginPasswordElement.value = '';
            window.location.href='./main.html';
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