// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getDatabase, child, get, ref, push, set } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBpWnewLNMbXyTJA1XmlsOCQX6VBAR-08M",
    authDomain: "online-chat-application-cfcfc.firebaseapp.com",
    projectId: "online-chat-application-cfcfc",
    storageBucket: "online-chat-application-cfcfc.appspot.com",
    messagingSenderId: "176507475474",
    appId: "1:176507475474:web:9a9e8cecd63ae32fb82acb",
    measurementId: "G-SG8Q89L96L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dataRef = ref(database, "users/");
// const analytics = getAnalytics(app);

// Database

// Get users data from database
async function getUsers() {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        }
        else {
            console.log("No such user data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return temp;
}

// Get user by given email address from database
async function getUserByEmail(email) {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            for (var userId in snapshot.val()) {
                if (snapshot.val()[userId].email === email) {
                    return snapshot.val()[userId];
                }
            }
        }
        else {
            console.log("No such user data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return temp;
}

// Write users data to the database
function writeNewUserData(email, username, password) {
    const newUserRef = push(dataRef);
    const userId = newUserRef.key;
    set(ref(database, "users/" + userId), {
        "email": email,
        "username": username,
        "password": password,
        "profile_picture": "https://i.pinimg.com/originals/0c/3b/3a/0c3b3adb1a7530892e55ef36d3be6cb8.png",
        "contacts": {
            [userId]: true,
        },
        "chats": { // old version "chats": [`${username}`]
            [username]: true,
        } 
    }).then(() => {
        // console.log("Data saved successfully");
    }).catch((error) => {
        // console.log("Data not saved");
    });
    return newUserRef.key;
}

// Session storage
var sessionStorage = window.sessionStorage;

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
window.addEventListener("load", (event) => {
    signUpDivElement.classList.add("hidden");

    // Setting inputs to default values
    signUpUsernameElement.value = "";
    signUpEmailElement.value = "";
    signUpPasswordElement.value = "";
    signUpConfPassElement.value = "";
    loginEmailElement.value = "";
    loginPasswordElement.value = "";
});

document.getElementById('to-sign-up-link').addEventListener("click", event => {
    loginDivElement.classList.add("hidden");
    signUpDivElement.classList.remove("hidden");
});

document.getElementById('to-login-link').addEventListener("click", event => {
    signUpDivElement.classList.add("hidden");
    loginDivElement.classList.remove("hidden");
});

// Sign up functionality

// Check for user with the same email address
async function existingSignUpgEmailAddress() {
    const signUpEmail = signUpEmailElement.value.trim();
    const usersPromise = getUsers();
    return usersPromise.then(function (users) {
        for (var userId in users) {
            if (users[userId].email === signUpEmail) {
                return true; // existing such email
            }
        }
        return false; // not existing email
    });
}

// Regex username function
function validateUsername(str) {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str); 
}

// Check for user with the same username
function existingUsername(username) {
    const usersPromise = getUsers();
    return usersPromise.then(function (users) {
        for (var userId in users) {
            if (users[userId].username === username) {
                return true; // existing such username
            }
        }
        return false; // not existing username
    });
}

// Username validation and visuals for correctness
function checkSignUpUsername() {
    const inputUsername = signUpUsernameElement.value.trim();
    if (inputUsername === "") {
        setErrorFor(signUpUsernameElement, "Username cannot be blank"); // add error message and red styling for input
    }
    else if(validateUsername(inputUsername)) {
        setErrorFor(signUpUsernameElement, "Username cannot contain special characters"); // add error message and red styling for input
    }
    else {
        existingUsername(inputUsername).then(function (existingUsername) {
            if (!existingUsername) {
                setSuccessFor(signUpUsernameElement); // add green styling for input
            }
            else {
                setErrorFor(signUpUsernameElement, "Username is already taken"); // add error message and red styling for input
            }
        });
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
    if ((validateEmail(inputEmail) === false) || (inputEmail === "")) {
        setErrorFor(signUpEmailElement, "Email address is not valid");
    }
    else {
        existingSignUpgEmailAddress().then(function (existingEmail) {
            if (existingEmail === true) {
                setErrorFor(signUpEmailElement, "This email address is already used");
            }
            else {
                setSuccessFor(signUpEmailElement);
            }
        });
    }
}

// Password validation and visuals for correctness
function checkSignUpPassword() {
    const inputPassword = signUpPasswordElement.value.trim();
    if (inputPassword.length < 6) {
        setErrorFor(signUpPasswordElement, "Password cannot be less than 6 characters");
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
        setErrorFor(signUpConfPassElement, "Passwords do not match");
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
    if (inputControl.classList.contains("error") === true) {
        setErrorFor(signUpConfPassElement, "Passwords do not match");
    }
    else {
        checkSignUpConfPass();
    }
}

// Display visual information for the given input in case denied validation - (add red styling)
function setErrorFor(input, message) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector("small"); // small - tag

    // Add message inside small
    small.innerHTML = `${message}`;

    // Add error class and remove success class
    inputControl.classList.add("error");
    inputControl.classList.remove("success");
}

// Display visual information for the given input in case of passed validation - (add green styling)
function setSuccessFor(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector("small"); // small - tag

    // Remove error message
    small.innerHTML = "";

    // Add success class and remove error class
    inputControl.classList.add("success");
    inputControl.classList.remove("error");
}

// Display default(onload) visual information for the given input (remove red/green styling)
function setNeutral(input) {
    const inputControl = input.parentElement; // .input-control - div
    const small = inputControl.querySelector("small"); // small - tag

    // Remove error message
    small.innerHTML = "";

    inputControl.classList.remove("success"); // remove pass validation styling
    inputControl.classList.remove("error");   // remove denied validation styling
}

signUpUsernameElement.addEventListener("change", event => {
    event.preventDefault();
    checkSignUpUsername(); // validatation and style
});

signUpEmailElement.addEventListener("change", event => {
    event.preventDefault();
    checkSignUpEmail(); // validatation and style
});

signUpPasswordElement.addEventListener("change", event => {
    event.preventDefault();
    if (signUpPasswordElement.value.trim() != "") {
        if (signUpConfPassElement.value !== "") {
            checkSignUpConfPass(); // validatation and style
        }
    }
    checkSignUpPassword(); // validatation and style
});

signUpConfPassElement.addEventListener("change", event => {
    event.preventDefault();
    checkSignUpConfPass(); // validatation and style
});

// Loop through inputs to check for errors
function successInputControl() {
    const inputControlList = document.getElementById("sign-up-user-info").querySelectorAll(".input-control"); // divs
    var counter = 0;
    for (let index = 0; index < inputControlList.length; index++) {
        if (inputControlList[index].classList.contains("success") === true) {
            counter++;
        }
    }
    return counter === inputControlList.length; // check number of successful validations
}

// Sign up validation and submition
signUpButtonElement.addEventListener("click", event => {
    event.preventDefault();
    if (successInputControl() === true) {
        const username = signUpUsernameElement.value.trim();
        const email = signUpEmailElement.value.trim();
        const password = signUpPasswordElement.value.trim();

        // Writing user to storage
        const key = writeNewUserData(email, username, password);
        sessionStorage.setItem("current-user", JSON.stringify(signUpEmailElement.value.trim()));
        sessionStorage.setItem("current-user-key", JSON.stringify(key));
        sessionStorage.setItem('current-user-username', JSON.stringify(username));

        signUpFormElement.submit();

        // Setting inputs to default values
        signUpUsernameElement.value = "";
        signUpEmailElement.value = "";
        signUpPasswordElement.value = "";
        signUpConfPassElement.value = "";
        window.location.href = "./main.html";
    }
    else {
        checkSignUpInputs();
    }
});

// Login functionality

// Check for user with the same email address
async function existingLogingEmailAddress() {
    const loginEmail = loginEmailElement.value.trim();
    const usersPromise = getUsers();
    return usersPromise.then(function (users) {
        for (var userId in users) {
            if (users[userId].email === loginEmail) {
                return true; // existing such email
            }
        }
        return false; // not existing email
    });
}

function checkLoginEmail() {
    const inputEmail = loginEmailElement.value.trim();
    if ((validateEmail(inputEmail) === false) || (inputEmail === '')) {
        setErrorFor(loginEmailElement, "Incorrect email address");
    }
    else {
        existingLogingEmailAddress().then(function (existingEmail) {
            if (existingEmail === false) {
                setErrorFor(loginEmailElement, "Email address is not registered");
            }
            else {
                setSuccessFor(loginEmailElement);
            }
        });
    }
}

loginEmailElement.addEventListener("change", event => {
    event.preventDefault();
    checkLoginEmail(); // validatation and style
});

// Validate email uniquesness
function existingLoginEmailAddress() {
    const loginEmail = loginEmailElement.value.trim();
    const usersPromise = getUsers();
    return usersPromise.then(function (users) {
        for (var userId in users) {
            if (users[userId].email === loginEmail) {
                return true; // existing such email
            }
        }
        return false; // not existing email
    });
}

// Check localstorage's records for matching email address and password
function checkEmailAndPass() {
    const inputEmail = loginEmailElement.value.trim();
    const inputPassword = loginPasswordElement.value.trim();
    const userDataPromise = getUserByEmail(inputEmail);
    return userDataPromise.then(function (user) {
        if (user.email === inputEmail && user.password === inputPassword) {
            return true;
        }
        else {
            return false;
        }
    });
}

// Login validation and submition
loginButtonElement.addEventListener("click", event => {
    event.preventDefault();
    existingLoginEmailAddress().then(function (existingEmail) {
        if (existingEmail === true) {
            setSuccessFor(loginEmailElement);
            checkEmailAndPass().then(function (isCorrect) {
                if (isCorrect === true) {
                    loginFormElement.submit();
                    sessionStorage.setItem("current-user", JSON.stringify(loginEmailElement.value.trim()));
                    setCurrentUserUsernameToSessionStorage(loginEmailElement.value.trim());

                    loginEmailElement.value = "";
                    loginPasswordElement.value = "";
                    window.location.href = "./main.html";
                }
                else {
                    setErrorFor(loginPasswordElement, "Incorrect password");
                }
            });
        }
        else {
            loginPasswordElement.value = '';
            setNeutral(loginPasswordElement);
            setErrorFor(loginEmailElement, "Incorrect email address");
        }
    });
});

async function setCurrentUserUsernameToSessionStorage(email) {
    let user = await getUserByEmail(email);
    sessionStorage.setItem('current-user-username', JSON.stringify(user.username));
}