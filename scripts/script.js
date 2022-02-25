// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getDatabase, ref, push, update, child, get, onValue } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
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
const usersRef = ref(database, "users/");
var currentUserKey = {};

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

// Get key of user by given email address from database
async function getKeyOfUserByEmail(email) {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            for (var userId in snapshot.val()) {
                if (snapshot.val()[userId].email === email) {
                    return userId;
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
const searchResultBufferWrapperElement = document.getElementById('search-results-buffer-wrapper');
const escapeSearchResultsButtonElement = document.getElementsByClassName('escape-search-results-btn')[0];
const addFriendButtonElements = document.getElementsByClassName('add-friend-btn');
const friendTabsBufferElement = document.getElementById('friend-tabs');
const friendRequestsCountElement = document.getElementById('friend-requests-count');

// Session storage
var sessionStorage = window.sessionStorage;

// Default onload page state
window.addEventListener('load', (event) => {
    friendListElement.classList.add('hidden');

    friendListButtonElement.classList.remove('active-menu-option');
    chatListButtonElement.classList.add('active-menu-option');

    // Search results
    searchResultBufferWrapperElement.classList.add('hidden');

    // Load current user data
    currentUserKey = getCurrentUserKey();
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
    const currentEmail = JSON.parse(sessionStorage.getItem("current-user"));
    const userDataPromise = getKeyOfUserByEmail(currentEmail);
    return userDataPromise.then(function (key) {
        return key;
    }).catch(function (error) {
        console.log(error);
    });
}

// Get current user data
function getCurrentUserData() {
    const currentEmail = JSON.parse(sessionStorage.getItem("current-user"));
    const userDataPromise = getUserByEmail(currentEmail);
    return userDataPromise.then(function (user) {
        return user;
    });
}

// Get and load current user data from database
function loadCurrentUser() {
    getCurrentUserData().then(function (user) {
        loadCurrentUserData(user);
    });
}

// Indicator - number of friend requests
getCurrentUserKey().then(function (currentUserKey) {
    const contactsRef = ref(database, 'users/' + currentUserKey + '/contacts/');
    onValue(contactsRef, (snapshot) => {
        var requestsCount = 0;
        const data = snapshot.val();
        for (var userId in data) {
            const isFriend = data[userId];
            if (isFriend === false) {
                ++requestsCount;
            }
        }
        if (requestsCount !== 0) {
            friendRequestsCountElement.classList.remove("hidden");
            friendRequestsCountElement.innerText = requestsCount;
        }
        else {
            friendRequestsCountElement.classList.add("hidden");
        }
    });
});

// Load user info
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
    showAllFriends();

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
    showAllFriends();

    filterRequestContactsButtonElement.classList.remove('current-filter');
});

// Filter contacts requests
filterRequestContactsButtonElement.addEventListener('click', (event) => {
    filterRequestContactsButtonElement.classList.add('current-filter');
    showFriendRequests();

    filterAllContactsButtonElement.classList.remove('current-filter');
});

// Search friends
searchInputElement.addEventListener('change', (event) => {
    const dbRef = ref(getDatabase());
    var data = {};
    var anySearchResults = false;
    searchResultBufferWrapperElement.classList.remove("hidden");
    searchResultBufferElement.innerHTML = `
    <button class="escape-search-results-btn">x</button>
    `;
    // get(child(dbRef, `users/`)).then((snapshot) => {
    //     if (snapshot.exists()) {
    //         getCurrentUserKey().then(function (currentUserKey) {
    //             data = snapshot.val();
    //             for (var key in data) {
    //                 if ((data[key].username === searchInputElement.value.trim()) && key !== currentUserKey) {
    //                     anySearchResults = true;
    //                     searchResultBufferElement.innerHTML += `
    //                     <div class="search-contact-tab">
    //                         <div class="image-username-wrapper">
    //                             <img src="${data[key].profile_picture}" class="user-profile-pic tab-element" alt="user_logo"/>
    //                             <span class="username tab-element">${data[key].username}</span>
    //                         </div>
    //                         <button class="add-friend-btn tab-element">Add</button>
    //                     </div>
    //                     `;
    //                 }
    //             }
    //             if (anySearchResults === false) {
    //                 searchResultBufferElement.innerHTML += `<span class="no-search-results">There is no user: ${searchInputElement.value.trim()}</span>`;
    //             }
    //         });
    //     } else {
    //         console.log("No data available");
    //     }
    // }).catch((error) => {
    //     console.error(error);
    // });

    const usersPromise = getUsers();
    usersPromise.then(function(users) {
        if (users) {
            getCurrentUserKey().then(function (currentUserKey) {
                for (var key in users) {
                    if ((users[key].username === searchInputElement.value.trim()) && key !== currentUserKey) {
                        anySearchResults = true;
                        searchResultBufferElement.innerHTML += `
                        <div class="search-contact-tab">
                            <div class="image-username-wrapper">
                                <img src="${users[key].profile_picture}" class="user-profile-pic tab-element" alt="user_logo"/>
                                <span class="username tab-element">${users[key].username}</span>
                            </div>
                            <button class="add-friend-btn tab-element">Add</button>
                        </div>
                        `;
                    }
                }
                if (anySearchResults === false) {
                    searchResultBufferElement.innerHTML += `<span class="no-search-results">There is no user: ${searchInputElement.value.trim()}</span>`;
                }
            });
        } else {
            console.log("No data available");
        }
    });
});

// Send friend request button
searchResultBufferElement.addEventListener("click", event => {
    const element = event.target;
    if (element.classList.contains("add-friend-btn")) {
        const contactTabElement = element.parentElement;
        const username = contactTabElement.querySelector("span").textContent.trim();
        const profile_picture = contactTabElement.querySelector("img").getAttribute("src");
        getCurrentUserKey().then(function (currentUserKey) {
            sendFriendRequest(username, profile_picture, currentUserKey);
            contactTabElement.classList.add("hidden");
        });
    }
    if (element.classList.contains("escape-search-results-btn")) {
        searchResultBufferWrapperElement.classList.add('hidden');
        searchInputElement.value = '';
    }
});

// Send friend request to user
function sendFriendRequest(username, profile_picture, currentUserKey) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'users/')).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                const userKey = user.key;
                const userData = user.val();
                if ((userData.username === username) && (userData.profile_picture === profile_picture) && (userKey !== currentUserKey)) {
                    if (userData.contacts[`${currentUserKey}`] !== true) {
                        userData.contacts[`${currentUserKey}`] = false;
                        const updates = {};
                        updates["users/" + userKey + "/contacts/"] = userData.contacts;
                        update(ref(database), updates);
                    }
                }
            });
        }
        else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

var user = {};
function getUser(userId) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, 'users/')).then((snapshot) => {
        if (snapshot.exists()) {
            user = snapshot.val()[`${userId}`];
        }
        else {
            console.log("No such user data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return user;
}

// Show friend requests
function showFriendRequests() {
    friendTabsBufferElement.innerHTML = ``;
    getCurrentUserKey().then(function (currentUserKey) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, 'users/')).then((user) => {
            if (user.exists()) {
                const data = user.val()[currentUserKey]['contacts'];
                for (var userId in data) {
                    const isFriend = data[userId];
                    if (isFriend === false) {
                        friendTabsBufferElement.innerHTML += `
                        <div class="friend-tab">
                            <img src="${user.val()[userId].profile_picture}" class="user-profile-pic" alt="user_logo" />
                            <span class="username">${user.val()[userId].username}</span>
                            <button class="friend-request-option-btn accept-friend-request-btn">Accept</button>
                            <button class="friend-request-option-btn decline-friend-request-btn">Decline</button>
                        </div>
                        `;
                    }
                }
            }
            else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    });
}

// Contact requests management
friendTabsBufferElement.addEventListener("click", event => {
    const element = event.target;
    if (element.classList.contains("accept-friend-request-btn")) {
        const requestTabElement = element.parentElement;
        const username = requestTabElement.querySelector("span").textContent.trim();
        const profile_picture = requestTabElement.querySelector("img").getAttribute("src");
        getCurrentUserKey().then(function(currentUserKey) {
            acceptFriendRequest(username, profile_picture, currentUserKey);
            requestTabElement.classList.add("hidden");
        });
    }
    if (element.classList.contains("decline-friend-request-btn")) {
        const requestTabElement = element.parentElement;
        const username = requestTabElement.querySelector("span").textContent.trim();
        const profile_picture = requestTabElement.querySelector("img").getAttribute("src");
        getCurrentUserKey().then(function(currentUserKey) {
            declineFriendRequest(username, profile_picture, currentUserKey);
            requestTabElement.classList.add("hidden");
        });
    }
});

// Accept friend request
function acceptFriendRequest(username, profile_picture, currentUserKey) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                const userKey = user.key;
                const userData = user.val();
                if ((userData.username === username) && (userData.profile_picture === profile_picture) && (userKey !== currentUserKey)) {
                    userData.contacts[`${currentUserKey}`] = true;
                    var updateSender = {};
                    updateSender["users/" + userKey + "/contacts/"] = userData.contacts;
                    update(ref(database), updateSender);
                    get(child(dbRef, `users/` + currentUserKey)).then((acceptingUser) => {
                        if (acceptingUser.exists()) {
                            const acceptedContact = acceptingUser.val().contacts;
                            acceptedContact[`${userKey}`] = true;
                            var updateReceiver = {};
                            updateReceiver["users/" + currentUserKey + "/contacts/"] = acceptedContact;
                            update(ref(database), updateReceiver);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Decline friend request
function declineFriendRequest(username, profile_picture, currentUserKey) {
    const dbRef = ref(getDatabase());
    get(child(dbRef, `users/`)).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((user) => {
                const userKey = user.key;
                const userData = user.val();
                if ((userData.username === username) && (userData.profile_picture === profile_picture) && (userKey !== currentUserKey)) {
                    delete userData.contacts[`${currentUserKey}`];
                    var updateSender = {};
                    updateSender["users/" + userKey + "/contacts/"] = userData.contacts;
                    update(ref(database), updateSender);
                    get(child(dbRef, `users/` + currentUserKey)).then((acceptingUser) => {
                        if (acceptingUser.exists()) {
                            const acceptedContact = acceptingUser.val().contacts;
                            delete acceptedContact[`${userKey}`];
                            var updateReceiver = {};
                            updateReceiver["users/" + currentUserKey + "/contacts/"] = acceptedContact;
                            update(ref(database), updateReceiver);
                        }
                    }).catch((error) => {
                        console.error(error);
                    });
                }
            });
        }
    }).catch((error) => {
        console.error(error);
    });
}

// Show all friends
function showAllFriends() {
    friendTabsBufferElement.innerHTML = ``;
    getCurrentUserKey().then(function(currentUserKey) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, 'users/')).then((user) => {
            if (user.exists()) {
                const data = user.val()[currentUserKey]['contacts'];
                for (var userId in data) {
                    const isFriend = data[userId];
                    if ((isFriend === true) && (userId !== currentUserKey)) {
                        friendTabsBufferElement.innerHTML += `
                        <div class="friend-tab">
                            <img src="${user.val()[userId].profile_picture}" class="user-profile-pic" alt="user_logo" />
                            <span class="username">${user.val()[userId].username}</span>
                            <div class="friend-dropdown-settings hidden">
                                <ul class="friend-tab-settings">
                                    <li class="friend-setting-option new-chat-btn">Message</li>
                                    <li class="friend-setting-option remove-friend-btn">Remove friend</li>
                                </ul>
                            </div>
                            <button class="friend-settings-btn"><img class="three-dots-img" src="./assets/icons/three_dots.png" alt="friend-settings-icon"/></button>
                        </div>
                        `;
                    }
                }
            }
            else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });
    });
}

function containsElement(key, arr) {
    for (var i in arr) {
        if (arr[i] === key) {
            return true;
        }
    }
    return false;
}

friendTabsBufferElement.addEventListener("click", (event) => {
    const element = event.target;
    if (element.classList.contains('three-dots-img')) {
        const buttonElement = element.parentElement;
        const friendTabElement = buttonElement.parentElement;
        const dropdownElement = friendTabElement.querySelector(".friend-dropdown-settings");
        if (dropdownElement.classList.contains('hidden')) {
            dropdownElement.classList.remove('hidden');
            // const ulElement = dropdownElement.children[0];
            // const newChatButtonElement = ulElement.children[0];
            // const removeFriendButtonElement = ulElement.children[1];
        }
        else {
            dropdownElement.classList.add('hidden');
        }
    }
    if (element.classList.contains('new-chat-btn')) {
        const friendTabElement = element.parentElement.parentElement.parentElement;
        const username = friendTabElement.querySelector("span").textContent.trim();
        // writeNewChat(...);
    }
    if (element.classList.contains('remove-friend-btn')) {
        const ulElement = element.parentElement;
        const dropdownElement = ulElement.parentElement;
        const friendTabElement = dropdownElement.parentElement;
        const username = friendTabElement.querySelector("span").textContent.trim();
        removeContact(username);
        friendTabElement.classList.add('hidden');
    }
});

/*
chat room
-name
-members
-messages
-private - true/false
*/
function writeNewChat(recipientKey, username, senderKey) {
    const newChatRef = push(database);
    const chatKey = newChatRef.key;
    set(ref(database, 'chats/' + chatKey), {
        "name": username,
        "members": [senderKey, recipientKey],
        "messages": {},
        "private": true
    }).then(() => {
        // console.log("Data saved successfully");
    })
        .catch((error) => {
            // console.log("Data not saved");
        });
    return newChatRef.key;
}

function removeContact(username) {
    getCurrentUserKey().then(function(currentUserKey) {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/`)).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((user) => {
                    const userKey = user.key;
                    const userData = user.val();
                    if ((userData.username === username) && (userKey !== currentUserKey)) {
                        get(child(dbRef, `users/` + currentUserKey)).then((currUser) => {
                            if (currUser.exists()) {
                                const contacts = currUser.val().contacts;
                                delete contacts[`${userKey}`];
                                var updates = {};
                                updates["users/" + currentUserKey + "/contacts/"] = contacts;
                                update(ref(database), updates);
                            }
                        }).catch((error) => {
                            console.error(error);
                        });
                    }
                });
            }
        }).catch((error) => {
            console.error(error);
        });
    });
}

/*
if (sessionStorage.user) {
    console.log(1)
} else {
    console.log('user not exist in the session storage')
}
*/