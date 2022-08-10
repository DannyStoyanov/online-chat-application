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
            console.log("#ERROR:getUserByKey(): No such user data available");
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
            console.log("#ERROR:getUserKeyByEmail(): No such user data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return temp;
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

// Get user by given username address from database
export async function getUserKeyByUsername(username) {
    const dbRef = ref(getDatabase());
    const temp = await get(child(dbRef, "users/")).then((snapshot) => {
        if (snapshot.exists()) {
            for (var userId in snapshot.val()) {
                if (snapshot.val()[userId].username === username) {
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

// sessionStorage.setItem("current-user-key", JSON.stringify(key));

async function getChatKey(members) {
    let chats = await getChats();
    if (chats === undefined) {
        console.log("Couln't find chats!");
        return undefined;
    }
    for (var i in chats) {
        var counter = 0;
        for (var j in members) {
            if(containsElement(members[j], chats[i].members) === true) {
                counter = counter + 1;
            }
        }
        if (counter === members.length) {
            return i;
        }
    }
}

export async function addChatKeyToUser(recipientUsername, currentUserUsername) {
    const senderKey = await getUserKeyByUsername(currentUserUsername);
    if (senderKey === undefined) {
        return undefined;
    }
    let chatKey = await getChatKey([recipientUsername, currentUserUsername]);
    addChatKeyToUserData(chatKey, senderKey);
}

export async function addChatKeyToUsersDataViaUsernames(chatKey, recipientUsername, currentUserUsername) {
    const recipientKey = await getUserKeyByUsername(recipientUsername);
    const senderKey = await getUserKeyByUsername(currentUserUsername);
    if (senderKey === undefined || recipientKey === undefined) {
        return undefined
    }
    addChatKeyToUsersData(chatKey, recipientKey, senderKey);
}

async function addChatKeyToUserData(chatKey, currentUserKey) {
    const sender = await getUserByKey(currentUserKey);
    if (sender === undefined) {
        return undefined;
    }
    var newChats = sender.chats;
    newChats[newChats.length]=chatKey;
    const updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

async function addChatKeyToUsersData(chatKey, recipientKey, currentUserKey) {
    const recipient = await getUserByKey(recipientKey);
    const sender = await getUserByKey(currentUserKey);
    if (sender === undefined || recipient === undefined) {
        return undefined
    }
    var newChats = sender.chats;
    newChats[newChats.length]=chatKey;
    const updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);
    newChats = [];
    newChats = recipient.chats;
    newChats[newChats.length]=chatKey;
    updates["users/" + recipientKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

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
    addChatKeyToUsersDataViaUsernames(chatKey, username, senderUsername);
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

// Creates default chat in the database
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

async function loadDefaultChat() {
    let currentUser = await getCurrentUserData;
    let currentUserKey = Object.keys(currentUser.contacts)[0];
    loadChatRoom(currentUserKey, "Fluffster Team", currentUserKey);
}

// Deletes chat from user's data
async function deleteChatInUserData(userKey, chatKey) {
    let user = await getUserByKey(userKey);
    if (user === undefined) {
        console.log("Couldn't delete chat in user's data due to not found user!");
        return undefined;
    }
    var newChats = user.chats;
    for (var i in newChats) {
        if (newChats[i] === chatKey) {
            delete newChats[i];
        }
    }
    var updates = {};
    updates["users/" + userKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

// Deletes chat from database
export async function deleteChat(members) {
    var chats = await getChats();
    for (var key in chats) {
        var chatData = chats[key];
        var counter = 0;
        for (var i in members) {
            if(containsElement(members[i], chatData.members) === true) {
                counter = counter + 1;
            }
        }
        if (counter === chatData.members.length) {
            var newChats = chats;
            delete newChats[`${key}`];
            var updates = {};
            updates["chats/"] = newChats;
            update(ref(database), updates);
            for (var i in members) {
                const userKey = await getUserKeyByUsername(members[i]);
                deleteChatInUserData(userKey, key);
                loadDefaultChat();
            }
            return undefined;
        }
    }
}

export async function removeChat(recipientUsername) {
    let recipientKey = await getUserKeyByUsername(recipientUsername);
    let recipient = await getUserByKey(recipientKey);
    let currentUser = await getCurrentUserData();
    if (currentUser === undefined || recipient === undefined) {
        console.log("Couldn't find user!");
        return undefined;
    }
    let currentUserKey = Object.keys(currentUser.contacts)[0];
    for (var i in currentUser.chats) {
        if (containsElement(currentUser.chats[i], recipient.chats) === true) {
            deleteChatInUserData(currentUserKey, currentUser.chats[i]);
        }
    }
}

const chatListElement = document.getElementById('chat-tabs');

// Display list of chats which the user is member of
export async function loadChatList() {
    chatListElement.innerHTML = ``;
    let user = await getCurrentUserData();
    if (user === undefined) {
        console.log("No data for current user found!");
        return undefined;
    }
    const keys = user.chats;
    if (user.chats.length === 1) {
        chatListElement.innerHTML = `<span class="empty-list-feedback-message">There are no active conversations</span>`;
        return undefined;
    }
    const chats = await getChats();
    for (var i in keys) {
        var chatData = chats[keys[i]];
        if(chatData !== undefined) {
            const timestamp = chatData.messages[(chatData.messages.length)-1].date;
            let date = new Date(timestamp);
            let displayDate = date.getDate()+
            "."+(date.getMonth()+1)+
            "."+date.getFullYear()+
            "\n"+date.getHours()+
            ":"+date.getMinutes();
            let lastMessage = chatData.messages[(chatData.messages.length)-1].text;
            let recipientKey = await getUserKeyByUsername(chatData.name);
            let recipient = await getUserByKey(recipientKey);
            let profile_picture = recipient.profile_picture;
            let empty = " ";
            chatListElement.innerHTML += `
                <div class="chat-tab">
                    <img src="${profile_picture}" class="user-profile-pic" alt="user_logo" />
                    <div class="chat-preview">
                        <div class="message-info">
                            <span class="username">${chatData.name}</span>
                            <span class="time-sent">${displayDate}</span>
                        </div>
                        <span class="message-preview">${lastMessage.split(' ').slice(0, 5).join(' ')}...</span>
                    </div>
                    <div class="chat-dropdown-settings hidden">
                        <ul class="chat-tab-settings">
                            <li class="chat-setting-option new-chat-btn">Add friend</li>
                            <li class="chat-setting-option remove-chat-btn">Delete chat</li>
                        </ul>
                    </div>
                    <button class="chat-settings-btn"><img class="three-dots-img" src="./assets/icons/three_dots.png" alt="chat-settings-icon"/></button>
                </div>
            `;
        }
    }
}

export async function loadChatRoomFromChatTab(recipientUsername) {
    let recipientKey = await getUserKeyByUsername(recipientUsername);
    let recipient = await getUserByKey(recipientKey);
    let currentUser = await getCurrentUserData();
    var chatKey;
    for( var i in currentUser.chats) {
        if(containsElement(currentUser.chats[i], recipient.chats) === true) {
            chatKey = currentUser.chats[i];
        }
    }
    if (chatKey === undefined) {
        // console.log("Error msg: Couldn't find chat!");
        return undefined;
    }
    let currentUserKey = Object.keys(currentUser.contacts)[0];
    loadChatRoom(recipientKey,  recipientUsername, currentUserKey);
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