// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
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
const currentUser = {};
// const analytics = getAnalytics(app);

const friendListElement = document.getElementById('friend-list-wrapper');
const chatListElement = document.getElementById('chat-list-wrapper');
const chatListButtonElement = document.getElementById('open-chat-list-btn');
const friendListButtonElement = document.getElementById('open-friend-list-btn');
const logOutButtonElement = document.getElementById('log-out-btn');
const filterAllMessagesButtonElement = document.getElementById('filter-all-messages-btn');
const filterUnreadMessagesButtonElement = document.getElementById('filter-unread-messages-btn');
const filterGroupsMessagesButtonElement = document.getElementById('filter-group-messages-btn');
const filterRequestsMessagesButtonElement = document.getElementById('filter-request-messages-btn');
const filterAllContactsButtonElement = document.getElementById('filter-all-contacts-btn');
const filterRequestContactsButtonElement = document.getElementById('filter-request-contacts-btn');
const searchInputElement = document.getElementById('searchfield');
const searchResultBufferElement = document.getElementById('search-results-buffer');
const escapeSearchResultsButtonElement = document.getElementById('escape-search-results-btn');
const addFriendButtonElements = document.getElementsByClassName('add-friend-btn');

// Localstorage
var storage = window.localStorage;

// Default onload page state
window.addEventListener('load', (event) => {
    friendListElement.classList.add('hidden');
    friendListButtonElement.classList.remove('active-menu-option');
    chatListButtonElement.classList.add('active-menu-option');

    // Load current user data
    loadCurrentUser();

    // Chat default filter
    filterAllMessagesButtonElement.classList.add('current-filter');

    // Contacts default filer
    filterAllContactsButtonElement.classList.add('current-filter');

    // chatListElement.classList.add("hidden");
    updateTitle();
});

// Get current user key
function getCurrentUserKey() {
    const currentEmail = JSON.parse(storage.getItem(`current-user`));
    const data = JSON.parse(storage.getItem(currentEmail));
    if (data === null) {
        console.log("Error. Current user isn't registered");
        return -1;
    }
    const key = data[3];
    return key;
}

// Get current user data from database
function loadCurrentUser() {
    const key = getCurrentUserKey();
    const dbRef = ref(getDatabase());
    var data = {};
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            data = snapshot.val()[key];
            loadCurrentUserData(data);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

function loadCurrentUserData(data) {
    const profilePictureElement = document.getElementById('user-profile-pic');
    const usernameElement = document.getElementById('profile-username');
    const emailElement = document.getElementById('profile-email');

    profilePictureElement.src = `${data["profile_picture"]}`;
    usernameElement.innerHTML = `${data["username"]}`;
    emailElement.innerHTML = `${data["email"]}`;
}

// Menu option behaviour - Messages
chatListButtonElement.addEventListener('click', (event) => {
    chatListButtonElement.classList.add('active-menu-option');
    friendListButtonElement.classList.remove('active-menu-option');

    chatListElement.classList.remove('hidden');
    friendListElement.classList.add('hidden');
    updateTitle();
});

// Menu option behaviour - Contacts
friendListButtonElement.addEventListener('click', (event) => {
    friendListButtonElement.classList.add('active-menu-option');
    chatListButtonElement.classList.remove('active-menu-option');

    friendListElement.classList.remove('hidden');
    chatListElement.classList.add('hidden');
    updateTitle();
});

// Updates title in relation to menu option
function updateTitle() {
    const appTitleElement = document.getElementById('listfield-title');
    if (chatListButtonElement.classList.contains('active-menu-option') === true) {
        appTitleElement.innerHTML = 'Messages';
    }
    else {
        appTitleElement.innerHTML = 'Contacts';
    }
}

logOutButtonElement.addEventListener('click', (event) => {
    logOut();
});

// Redirect to login page
function logOut() {
    window.location.href = "index.html";
}

// Chat filter settings:

// Filter all messages
filterAllMessagesButtonElement.addEventListener('click', (event) => {
    filterAllMessagesButtonElement.classList.add('current-filter');

    filterUnreadMessagesButtonElement.classList.remove('current-filter');
    filterGroupsMessagesButtonElement.classList.remove('current-filter');
    filterRequestsMessagesButtonElement.classList.remove('current-filter');
});

// Filter unread messages
filterUnreadMessagesButtonElement.addEventListener('click', (event) => {
    filterUnreadMessagesButtonElement.classList.add('current-filter');

    filterAllMessagesButtonElement.classList.remove('current-filter');
    filterGroupsMessagesButtonElement.classList.remove('current-filter');
    filterRequestsMessagesButtonElement.classList.remove('current-filter');
});

// Filter groups messages
filterGroupsMessagesButtonElement.addEventListener('click', (event) => {
    filterGroupsMessagesButtonElement.classList.add('current-filter');

    filterAllMessagesButtonElement.classList.remove('current-filter');
    filterUnreadMessagesButtonElement.classList.remove('current-filter');
    filterRequestsMessagesButtonElement.classList.remove('current-filter');
});

// Filter requests messages
filterRequestsMessagesButtonElement.addEventListener('click', (event) => {
    filterRequestsMessagesButtonElement.classList.add('current-filter');

    filterAllMessagesButtonElement.classList.remove('current-filter');
    filterUnreadMessagesButtonElement.classList.remove('current-filter');
    filterGroupsMessagesButtonElement.classList.remove('current-filter');
});

// Contact filter settings

// Filter all contacts
filterAllContactsButtonElement.addEventListener('click', (event) => {
    filterAllContactsButtonElement.classList.add('current-filter');

    filterRequestContactsButtonElement.classList.remove('current-filter');
});

// Filter contacts requests
filterRequestContactsButtonElement.addEventListener('click', (event) => {
    filterRequestContactsButtonElement.classList.add('current-filter');

    filterAllContactsButtonElement.classList.remove('current-filter');
});

// Search friends
searchInputElement.addEventListener('change', (event) => { // 'keyup'
    const dbRef = ref(getDatabase());
    var data = {};
    searchResultBufferElement.innerHTML = ``;
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            data = snapshot.val();
            for (var key in data) {
                if((data[key].username === searchInputElement.value.trim()) && data[key] !== currentUser) {
                    searchResultBufferElement.innerHTML += `
                    <div class="search-contact-tab">
                        <div class="image-username-wrapper">
                            <img src="${data[key].profile_picture}" class="user-profile-pic tab-element" alt="user_logo"/>
                            <span class="username tab-element">${data[key].username}</span>
                        </div>
                        <button class="add-friend-btn tab-element">Add</button>
                    </div>
                    `;
                }
            }
            if(searchResultBufferElement.innerHTML === ``) {
                searchResultBufferElement.innerHTML = `<span>No results</span>`;
            }
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
});

// Send friend request button
searchResultBufferElement.addEventListener("click", event => {
    const element = event.target;
    if(element.classList.contains("add-friend-btn")) {
        const contactTabemElement = element.parentElement;
        const username = contactTabemElement.querySelector("span").textContent.trim();
        const profile_picture = contactTabemElement.querySelector("img").getAttribute("src");
        const senderKey = getCurrentUserKey();
        sendFriendRequest(username, profile_picture, senderKey);
    }
});

// Send friend request to exact user
function sendFriendRequest(username, profile_picture, senderKey) {
    var data = {};
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            data = snapshot.val();
            for(var key in data) {
                if((data[key].username === username) && (data[key].profile_picture === profile_picture)) {
                    get(child(dbRef, 'users/' + key)).then((user) => {
                        var contacts = user.val()["contacts"];
                        contacts[`${senderKey}`]=false;
                        const database = ref(getDatabase());
                        const dataRef = ref(database, "users/"+key);
                        // REWORK HERE
                        console.log("done");
                    });
                }
            }
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

/*
if (sessionStorage.user) {
    console.log(1)
} else {
    console.log('user not exist in the session storage')
}
*/