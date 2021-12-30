// Sign up
const signUpForm = document.getElementById("sign-up-form");
const submitButton = document.getElementById("submit-button");

function checkEmailAndPass(user) {
    const email = user[1];
    const password = user[2];
    for (let index = 0; index < storage.length; index++) {
        var record = storage.getItem();
        if((record['email'] === email) && (record['password']===password)) {
            return true;
        }
    }
    return false;
}

function existingUser(user) {
    const email = user[1];
    for (let index = 0; index < storage.length; index++) {
        const record = storage.getItem(`user_${index}`);
        if(record['email'] === email) {
            return true;
        }
    }
    return false;
}

function checkInputs() {
    // getting the input information
    const username = document.getElementById("sign-up-username");
    const email = document.getElementById("sign-up-email");
    const password = document.getElementById("sign-up-password");
    const conf_pass = document.getElementById("sign-up-conf-pass");

    if(username === '') {
        setErrorFor(username, 'Username cannot be blank');
    }
    else {
        setSuccessFor(username);
    }


}

function setErrorFor(input, message) {
    const inputControl = input.parentElement;
    const small = inputControl.querySelector("small");

    // adding message inside small
    small.innerHEML = `${message}`;

    // add error class
    inputControl.classList.add('error');
}

submitButton.addEventListener("click", event => {
    event.preventDefault();

    checkInputs();


});