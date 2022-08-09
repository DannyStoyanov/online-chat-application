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
var currentUserKey = {};

// Default onload page state
window.addEventListener('load', (event) => {
    createDefaultChat();
    setCurrentUserKeyToSessionStorage();
    // const currentUserChatsPromise = getCurrentUserChats();
    // currentUserChatsPromise.then(function (currentUserChats) {
    //     console.log(currentUserChats); 
    // });
});

// Session storage
var sessionStorage = window.sessionStorage;

/*
chat room
-name
-members
-messages
-private - true/false
*/

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

// Get user by given key address from database
async function getUserByKey(userKey) {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "users/" + userKey)).then((snapshot) => {
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

export async function getUserKeyByEmail(email) {
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

async function setCurrentUserKeyToSessionStorage() {

}

// Get current user data
async function getCurrentUserData() {
    const currentEmail = JSON.parse(sessionStorage.getItem("current-user"));
    const userData = await getUserByEmail(currentEmail);
    return userData;
}

// Get chats data from database
async function getChats() {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "chats/")).then((snapshot) => {
        if (snapshot.exists()) {
            return snapshot.val();
        }
    }).catch((error) => {
        console.log(error);
    });
    return temp;
}

async function getCurrentUserChats() {
    const chats = await getChats();
    const user = await getCurrentUserData();
    var arr = [];
    for (var key in chats) {
        const chatKey = key;
        const chatData = chats[key];
        for (var member in chatData.members) {
            if(user.username == chatData.members[member]) {
                arr.push(chatKey);
            }
        }
    }
    return arr;
}

// sessionStorage.setItem("current-user-key", JSON.stringify(key));

export function createNewChat(senderUsername, username) {
    const dataRef = ref(database, "chats/");
    const newChatRef = push(dataRef);
    const chatKey = newChatRef.key;
    set(ref(database, "chats/" + chatKey), {
        "name": username,
        "members": [senderUsername, username],
        // "private": true,
        "messages": [{ // {
            "username": `--- Fluffster team ---`,
            "date": Date.now(),
            "text": "Welcome to the new chat room!",
        }] // }
    }).then(() => {
        // console.log("Data saved successfully");
    }).catch((error) => {
        // console.log("Data not saved");
    });
    sessionStorage.setItem("current-chat-key", JSON.stringify(newChatRef.key.trim()));
    return newChatRef.key;
}

// Linear search
function containsElement(key, arr) {
    for (var i in arr) {
        if (arr[i] === key) {
            return true;
        }
    }
    return false;
}

// Check for existing chat
export async function existingChat(members) {
    const chatsPromise = getChats();
    return await chatsPromise.then(function (chats) {
        if (chats === undefined) {
            return false;
        }
        for (var key in chats) {
            const chatKey = key;
            const chatData = chats[key];
            var counter = 0;
            if (members.length === chatData.members.length) {
                for (var key in members) {
                    if (containsElement(members[key], chatData.members) === true) {
                        counter = counter + 1;
                    }
                }
            }
            if (counter == members.length) {
                return true;
            }
        }
        return false;
    });
}

async function createDefaultChat() {
    getCurrentUserData().then(function (user) {
        const existingChatPromise = existingChat([user.username, "Fluffster Team"]);
        existingChatPromise.then(function (exists) {
            if (!exists) {
                const chatKey = createNewChat(user.username, "Fluffster Team");
                // writeNewMessages("Chat sample", chatKey);
            }
        });
        const currentUserEmail = JSON.parse(sessionStorage.getItem("current-user"));
        const currentUserKeyPromise = getUserKeyByEmail(currentUserEmail);
        currentUserKeyPromise.then((currentUserKey) => {
            loadChatRoom(currentUserKey, "Fluffster Team", currentUserKey);
            sessionStorage.setItem("current-user-key", JSON.stringify(currentUserKey));
        });
        // createNewChat(user.username, "Fluffster Team");
    });
}

// Messages
const currentChatKey = JSON.parse(sessionStorage.getItem("current-chat-key"));
const msgsRef = ref(database, "chats/" + currentChatKey + "/messages/");
const messageInputElement = document.getElementById('message-input');
// const sendMessageBtnElement = document.getElementById('send-message-btn');
const chatRoomTitle = document.getElementById('chat-room-header');

export async function loadChatRoom(recipientKey, username, currentUserKey) {
    const user = await getUserByKey(recipientKey);
    if (user == undefined) {
        console.log("Couldn't load chat room!");
        return undefined;
    }
    chatRoomTitle.innerHTML = `
    <div id="chat-room-header">
    <div>
        <img src="${user.profile_picture}" alt="user-profile-pic"
            id="user-profile-pic-chat" />
    </div>
    <div id="chat-room-name">
        <span>${user.username}</span>
    </div>
    <div>
    </div>
    `;
}

// ---------------------------------------------------------------------------------------------------------------------



// // Load default chat
// function loadDefaultChatWindow() {
//     const defaultChatKey = JSON.parse(sessionStorage.getItem("default-chat-key"));
//     loadChatWindow(defaultChatKey);
// }

// function loadChatWindow(chatKey) {
//     const dbRef = ref(getDatabase());
//     get(child(dbRef, "chats/" + chatKey + "/messages/")).then((messages) => {
//         if (messages.exists()) {
//             const messageListElement = document.getElementById('message-list');
//             const messagesList = messages.val();
//             for (var key in messagesList) {
//                 const message = messagesList[key];
//                 const listItem = document.createElement("li");
//                 const currentUserPromise = getCurrentUserData();
//                 currentUserPromise.then(function (currentUser) {
//                     if (message.username === currentUser.username) {
//                         listItem.innerHTML = `
//                         <div class="message-right messages">
//                             <div>
//                                 <span class="message-username"><b>${message.username}</b></span>
//                                 <span class="message-date">${new Date(message.date).toLocaleString()}</span>
//                             </div>
//                             <span class="message-text">${message.text}</span>
//                         </div>
//                         `;
//                     }
//                     else {
//                         listItem.innerHTML = `
//                         <div class="message-left messages">
//                             <div>
//                                 <span class="message-username"><b>${message.username}</b></span>
//                                 <span class="message-date">${new Date(message.date).toLocaleString()}</span>
//                             <div>
//                             <span class="message-text">${message.text}</span>
//                         </div>
//                         `;
//                     }
//                 });
//                 messageListElement.appendChild(listItem);
//             }
//         }
//     });
// }
// // const currentUserKeyPromise = getCurrentUserKey();
// // currentUserKeyPromise.then(function (key) {
// //     const currentUserPromise = getCurrentUserData();
// //     currentUserPromise.then(function (currentUser) {
// //         const existingChatPromise = existingChat([currentUser.username, username]);
// //         existingChatPromise.then(function (exists) {
// //             if (!exists) {
// //                 const chatKey = createNewChat(currentUser.username, currentUser.username);
// //                 writeNewMessages("Chat sample", chatKey);
// //             }
// //             loadChatRoom(key, currentUser.username, key);
// //         });
// //     });
// // });

// function writeDefaultChat(senderUsername) {
//     const dataRef = ref(database, "chats/");
//     const newChatRef = push(dataRef);
//     const chatKey = newChatRef.key;
//     set(ref(database, "chats/" + chatKey), {
//         "name": `Fluffster`,
//         "members": [senderUsername],
//         "private": true,
//         "messages": [] // {}
//     }).then(() => {
//         // console.log("Data saved successfully");
//     }).catch((error) => {
//         // console.log("Data not saved");
//     });
//     messageInputElement.value = "";
//     return newChatRef.key;
// }

// function createNewChat(senderUsername, username) {
//     const dataRef = ref(database, "chats/");
//     const newChatRef = push(dataRef);
//     const chatKey = newChatRef.key;
//     set(ref(database, "chats/" + chatKey), {
//         "name": username,
//         "members": [senderUsername, username],
//         "private": true,
//         "messages": [{ // {
//             // "username": `--- new chat ---`,
//             // "date": Date.now(),
//             // "text": "",
//         }] // }
//     }).then(() => {
//         // console.log("Data saved successfully");
//     }).catch((error) => {
//         // console.log("Data not saved");
//     });
//     return newChatRef.key;
// }

// function loadChatRoom(recipientKey, username, currentUserKey) {
//     const userPromise = getUserByKey(recipientKey);
//     userPromise.then(function (user) {
//         chatRoomTitle.innerHTML = `
//         <div id="chat-room-header">
//         <div>
//             <img src="${user.profile_picture}" alt="user-profile-pic"
//                 id="user-profile-pic-chat" />
//         </div>
//         <div id="chat-room-name">
//             <span>${user.username}</span>
//         </div>
//         <div>
//         </div>
//         `;
//     });
// }

// // Messages
// const currentChatKey = JSON.parse(sessionStorage.getItem("current-chat-key"));
// const msgsRef = ref(database, "chats/" + currentChatKey + "/messages/");
// const messageInputElement = document.getElementById('message-input');
// // const sendMessageBtnElement = document.getElementById('send-message-btn');

// // sendMessageBtnElement.addEventListener("click", event => {
// //     const currentChatKey = JSON.parse(sessionStorage.getItem("current-chat-key"));
// //     console.log(currentChatKey);
// //     const msgsRef = ref(database, "chats/" + currentChatKey + "/messages/");
// //     console.log(msgsRef);
// //     const messageRef = push(msgsRef);
// //     const currentUserPromise = getCurrentUserData();
// //     currentUserPromise.then(function(currentUser) {
// //         set(messageRef, {
// //             "username": currentUser.username,
// //             "date": Date.now(),
// //             "text": messageInputElement.value,
// //         });
// //      messageInputElement.value = "";
// //     });
// // });

// messageInputElement.addEventListener("change", event => {
//     const currentChatKey = JSON.parse(sessionStorage.getItem("current-chat-key"));
//     const msgsRef = ref(database, "chats/" + currentChatKey + "/messages/");
//     const messageRef = push(msgsRef);
//     const currentUserPromise = getCurrentUserData();
//     currentUserPromise.then(function (currentUser) {
//         set(messageRef, {
//             "username": currentUser.username,
//             "date": Date.now(),
//             "text": messageInputElement.value,
//         });
//         messageInputElement.value = "";
//     });
// });

// onChildAdded(msgsRef, (data) => {
//     const messageListElement = document.getElementById('message-list');
//     const message = data.val();
//     const listItem = document.createElement("li");
//     const currentUserPromise = getCurrentUserData();
//     currentUserPromise.then(function (currentUser) {
//         if (message.username === currentUser.username) {
//             listItem.innerHTML = `
//         <div class="message-right messages">
//             <div>
//                 <span class="message-username"><b>${message.username}</b></span>
//                 <span class="message-date">${new Date(message.date).toLocaleString()}</span>
//             </div>
//             <span class="message-text">${message.text}</span>
//         </div>
//         `;
//         }
//         else {
//             listItem.innerHTML = `
//         <div class="message-left messages">
//             <div>
//                 <span class="message-username"><b>${message.username}</b></span>
//                 <span class="message-date">${new Date(message.date).toLocaleString()}</span>
//             <div>
//             <span class="message-text">${message.text}</span>
//         </div>
//         `;
//         }
//     });
//     messageListElement.appendChild(listItem);
// });

// // function writeNewMessages(recipient, chatKey) {
// //     const dataRef = ref(database, "messages/");
// //     const newMessagesRef = push(dataRef);
// //     const messageKey = newMessagesRef.key;
// //     set(ref(database, "messages/" + messageKey), {
// //         "chatId": chatKey
// //     }).then(() => {
// //         // console.log("Data saved successfully");
// //     }).catch((error) => {
// //         // console.log("Data not saved");
// //     });
// //     return newMessagesRef.key;
// // }

// ---------------------------------------------------------------------------------------------------------------------

// function setDefaultChatsDatabaseState() {
//     const currentUserPromise = getCurrentUserData();
//     currentUserPromise.then(function (currentUser) {
//         const chatsPromise = getChats();
//         return chatsPromise.then(function (chats) {
//             if (chats !== undefined) {
//                 var existingChat = false;
//                 for (var key in chats) {
//                     console.log(`${chats[key].name}  ---  ${chats[key].members} --- ${currentUser.username}`);
//                     if ((chats[key].name === "Fluffster") && (chats[key].members[0] === currentUser.username)) {
//                         console.log("PASS");
//                         // sessionStorage.setItem("default-chat-key", JSON.stringify(key));
//                         // sessionStorage.setItem("current-chat-key", JSON.stringify(key));
//                         existingChat = true;
//                     }
//                 }
//                 if (existingChat === false) {
//                     let defaultChatKey = writeDefaultChat(currentUser.username);
//                     sessionStorage.setItem("default-chat-key", JSON.stringify(defaultChatKey));
//                     sessionStorage.setItem("current-chat-key", JSON.stringify(defaultChatKey));
//                 }
//             }
//             else {
//                 let defaultChatKey = writeDefaultChat(currentUser.username);
//                 sessionStorage.setItem("default-chat-key", JSON.stringify(defaultChatKey));
//                 sessionStorage.setItem("current-chat-key", JSON.stringify(defaultChatKey));
//             }
//             // loadDefaultChatWindow();
//         });
//     });
// }