// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-app.js";
import { getDatabase, ref, push, set, update, child, get, onValue, onChildAdded } from "https://www.gstatic.com/firebasejs/9.6.4/firebase-database.js";
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

// Get users data from database
export async function getUsers() {
    const dbRef = ref(getDatabase());
    const users = await get(child(dbRef, "users/"));
    if (users === undefined) {
        console.error("utils.getUsers(): Couldn't get users data from database!");
        return undefined;
    }
    return users.val();
}

// Get user by given email address from database
export async function getUserByEmail(email) {
    const dbRef = ref(getDatabase());
    var users = await get(child(dbRef, "users/"));
    if (users === undefined) {
        console.error("utils.getUserByEmail(_): Couldn't get users data from database!");
        return undefined;
    }
    users = users.val();
    for (var userId in users) {
        if (users[userId].email === email) {
            return users[userId];
        }
    }
    return undefined;
}

// Get key of user by given email address from database
export async function getUserKeyByEmail(email) {
    const dbRef = ref(getDatabase());
    var users = await get(child(dbRef, "users/"));
    if (users === undefined) {
        console.error("utils.getUserKeyByEmail(_): Couldn't get users data from database!");
        return undefined;
    }
    users = users.val();
    for (var userId in users) {
        if (users[userId].email === email) {
            return userId;
        }
    }
    return undefined;
}

// Get user by given username address from database
export async function getUserKeyByUsername(username) {
    const dbRef = ref(getDatabase());
    var users = await get(child(dbRef, "users/"));
    if (users === undefined) {
        console.error("utils.getUserKeyByUsername(_): Couldn't get users data from database!");
        return undefined;
    }
    users = users.val();
    for (var userId in users) {
        if (users[userId].username === username) {
            return userId;
        }
    }
    return undefined;
}

// Get current user key
export async function getCurrentUserKey() {
    const currentEmail = JSON.parse(sessionStorage.getItem("current-user"));
    const userKey = await getUserKeyByEmail(currentEmail);
    if (userKey === undefined) {
        console.error("utils.getCurrentUserKey(): Couldn't get current user key data from database!");
        return undefined;
    }
    return userKey;
}

// Get current user data
export async function getCurrentUserData() {
    const currentEmail = JSON.parse(sessionStorage.getItem("current-user"));
    const user = getUserByEmail(currentEmail);
    if (user === undefined) {
        console.error("utils.getCurrentUserData(): Couldn't get user data from database!");
        return undefined;
    }
    return user;
}

// Get user data by key
export async function getUser(userId) {
    const dbRef = ref(getDatabase());
    var user = await get(child(dbRef, 'users/'));
    if (user === undefined) {
        console.error("utils.getUser(_): Couldn't get user data from database!");
        return undefined;
    }
    user = user.val()[`${userId}`];
    return user;
}

// Get user by given key address from database
export async function getUserByKey(userKey) {
    const dbRef = ref(getDatabase());
    var user = await get(child(dbRef, "users/" + userKey));
    if (user === undefined) {
        console.error("utils.getCurrentUserData(): Couldn't get user data from database!");
        return undefined;
    }
    user = user.val();
    return user;
}

// Get key of user by given email address from database
export async function getKeyOfUserByEmail(email) {
    const dbRef = ref(getDatabase());
    var users = await get(child(dbRef, "users/"));
    if (users === undefined) {
        console.error("utils.getUserByEmail(_): Couldn't get users data from database!");
        return undefined;
    }
    users = users.val();
    for (var userId in users) {
        if (users[userId].email === email) {
            return userId;
        }
    }
    return undefined;
}