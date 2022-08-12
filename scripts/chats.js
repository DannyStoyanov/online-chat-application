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

// imports:
import * as utils from "./utils.js";

// Session storage
var sessionStorage = window.sessionStorage;

// DOM elements:
const chatListElement = document.getElementById('chat-tabs');
const chatTabsBufferElement = document.getElementById('chat-tabs');

// Default onload page state
window.addEventListener('load', (event) => {
    // createDefaultChat();
    // setDefaultChatKeyToSessionStorage();
});

/*
chat room
-name
-members
-messages
-private - true/false
*/

async function getDefaultChat() {
    let user = await utils.getCurrentUserData();
    let chats = await getChats();
    for (var i in chats) {
        if ((containsElement(user.username, chats[i].members) === true) && (containsElement("Fluffster Team", chats[i].members) === true)) {
            return i;
        }
    }
    return undefined;
}

// Rename user's first chat due to initial write problem - #NOTE: incorrect logic!
export async function renameFirstChat() {
    let currentUserKey = await utils.getCurrentUserKey();
    let user = await utils.getCurrentUserData();
    if (user === undefined) {
        return undefined;
    }
    let chatKey = await getDefaultChat();
    for (var i in user.chats) {
        if (i === user.username) {
            var newChats = user.chats;
            newChats[`${chatKey}`] = true;
            delete newChats[`${user.username}`];
            const updates = {};
            updates["users/" + currentUserKey + "/chats/"] = newChats;
            update(ref(database), updates);
        }
    }
}

// Get chats data from database
async function getChats() {
    const dbRef = ref(getDatabase());
    var chats = await get(child(dbRef, "chats/"));
    if (chats === undefined) {
        console.error("chats.getChats(): Couldn't get chats data from database!");
        return undefined;
    }
    chats = chats.val();
    return chats;
}

// Get chat key by list of members
async function getChatKey(members) {
    let chats = await getChats();
    if (chats === undefined) {
        console.log("Couln't find chats!");
        return undefined;
    }
    for (var i in chats) {
        var counter = 0;
        for (var j in members) {
            if (containsElement(members[j], chats[i].members) === true) {
                counter = counter + 1;
            }
        }
        if (counter === members.length) {
            return i;
        }
    }
}

// Get chat data by chat key
async function getChatByKey(chatKey) {
    let chats = await getChats();
    return chats[chatKey];
}

// Helper function for addChatKeyToUser
async function addChatKeyToUserData(chatKey, currentUserKey) {
    const sender = await utils.getUserByKey(currentUserKey);
    if (sender === undefined) {
        return undefined;
    }
    for (var i in sender.chats) {
        if (chatKey === sender.chats[i]) {
            return undefined;
        }
    }
    var newChats = sender.chats;
    newChats[`${chatKey}`] = false;
    const updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

// Add chat key to user's data in database
export async function sendMessageRequest(recipientUsername, currentUserUsername) {
    const senderKey = await utils.getUserKeyByUsername(currentUserUsername);
    if (senderKey === undefined) {
        return undefined;
    }
    let chatKey = await getChatKey([recipientUsername, currentUserUsername]);
    addChatKeyToUserData(chatKey, senderKey);
}

// Helper function for addChatKeyToUsersDataViaUsernames
async function addChatKeyToUsersData(chatKey, recipientKey, currentUserKey) {
    const recipient = await utils.getUserByKey(recipientKey);
    const sender = await utils.getUserByKey(currentUserKey);
    if (sender === undefined || recipient === undefined) {
        return undefined
    }
    var newChats = sender.chats;
    newChats[`${chatKey}`] = true;
    const updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);
    newChats = [];
    newChats = recipient.chats;
    newChats[`${chatKey}`] = false;
    updates["users/" + recipientKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

// Update users data database by adding chat key to each one's chat key records by passing usernames
export async function addChatKeyToUsersDataViaUsernames(chatKey, recipientUsername, currentUserUsername) {
    const recipientKey = await utils.getUserKeyByUsername(recipientUsername);
    const senderKey = await utils.getUserKeyByUsername(currentUserUsername);
    if (senderKey === undefined || recipientKey === undefined) {
        return undefined;
    }
    addChatKeyToUsersData(chatKey, recipientKey, senderKey);
}

// Creates new chat and saves it to database
export function createNewChat(senderUsername, username) {
    const dataRef = ref(database, "chats/");
    const newChatRef = push(dataRef);
    const chatKey = newChatRef.key;
    set(ref(database, "chats/" + chatKey), {
        "name": username,
        "members": [senderUsername, username],
        // "private": true,
        "messages": [{ // {
            "username": `Fluffster team`,
            "date": Date.now(),
            "text": "Welcome!",
        }] // }
    }).then(() => {
        // console.log("Data saved successfully");
    }).catch((error) => {
        console.error("chats.createNewChat(_): Couldn't write chat to database!");
    });
    sessionStorage.setItem("current-chat-key", JSON.stringify(newChatRef.key.trim()));
    addChatKeyToUsersDataViaUsernames(chatKey, username, senderUsername);
    return newChatRef.key;
}

// Set default chat key to session storage
async function setDefaultChatKeyToSessionStorage() {
    let user = await utils.getCurrentUserData();
    let chatKey = await getChatKey([user.username, "Fluffster Team"]);
    sessionStorage.setItem("current-chat-key", JSON.stringify(chatKey));
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

// Creates default chat for each user on sign up or loads existing one
export async function createDefaultChat() {
    let user = await utils.getCurrentUserData();
    let exists = await existingChat([user.username, "Fluffster Team"]);
    if (!exists) {
        const chatKey = createNewChat(user.username, "Fluffster Team");
        // loadDefaultChat();
        // writeNewMessages("Chat sample", chatKey);
    }
    else {
        const currentUserEmail = JSON.parse(sessionStorage.getItem("current-user"));
        const currentUserKey = await utils.getUserKeyByEmail(currentUserEmail);
        sessionStorage.setItem("current-user-key", JSON.stringify(currentUserKey));
        // loadDefaultChat();
    }
}

// Load default chat
async function loadDefaultChat() {
    let currentUser = await utils.getCurrentUserData();
    let currentUserKey = await utils.getCurrentUserKey();
    loadChatRoom(currentUserKey, "Fluffster Team", currentUserKey);
    let chatKey = await getChatKey([currentUser.username, "Fluffster Team"]);
    sessionStorage.setItem("current-chat-key", JSON.stringify(chatKey));
}

// Deletes chat from user's data
async function deleteChatInUserData(userKey, chatKey) {
    let user = await utils.getUserByKey(userKey);
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
            if (containsElement(members[i], chatData.members) === true) {
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
                const userKey = await utils.getUserKeyByUsername(members[i]);
                deleteChatInUserData(userKey, key);
                console.log(userKey, key);
                loadDefaultChat();
            }
            return undefined;
        }
    }
}

// Removes chat from chat tabs - Messages
export async function removeChat(recipientUsername) {
    let recipientKey = await utils.getUserKeyByUsername(recipientUsername);
    let recipient = await utils.getUserByKey(recipientKey);
    let currentUser = await utils.getCurrentUserData();
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

export async function loadMessageRequests() {
    chatTabsBufferElement.innerHTML = ``;
    const currentUserKey = await utils.getCurrentUserKey();
    const users = await utils.getUsers();
    const chats = users[currentUserKey]['chats'];
    for (var chatId in chats) {
        const isApproved = chats[chatId];
        if (isApproved === false) {
            const chat = await getChatByKey(chatId);
            var requester = [];
            for (var i in chat.members) {
                if (chat.members[i] !== users[currentUserKey].username) {
                    requester = chat.members[i];
                    break;
                }
            }
            const requesterKey = await utils.getUserKeyByUsername(requester);
            const requesterData = await utils.getUserByKey(requesterKey);
            chatTabsBufferElement.innerHTML += `
            <div class="chat-tab">
                <img src="${requesterData.profile_picture}" class="user-profile-pic" alt="user_logo" />
                <span class="username">${requesterData.username}</span>
                <button class="chat-request-option-btn accept-chat-request-btn">Accept</button>
                <button class="chat-request-option-btn decline-chat-request-btn">Decline</button>
            </div>
            `;
        }
    }
}

// Display list of chats which the user is member of
export async function showAllChats() {
    chatListElement.innerHTML = ``;
    let user = await utils.getCurrentUserData();
    if (user === undefined) {
        console.log("No data for current user found!");
        return undefined;
    }
    const chats = user.chats;
    if (user.chats.length <= 1) {
        chatListElement.innerHTML = `<span class="empty-list-feedback-message">There are no active conversations</span>`;
        return undefined;
    }
    const chatsDatabase = await getChats();
    if (chatsDatabase === null) {
        return undefined;
    }
    for (var i in chats) {
        var isApproved = chats[i];
        var chatData = chatsDatabase[i];
        if (isApproved === true) {
            const timestamp = chatData.messages[(chatData.messages.length) - 1].date;
            let date = new Date(timestamp);
            let displayDate = date.getDate() +
                "." + (date.getMonth() + 1) +
                "." + date.getFullYear() +
                "\n" + date.getHours() +
                ":" + date.getMinutes();
            let lastMessage = chatData.messages[(chatData.messages.length) - 1].text;
            if (chatData.name === "Fluffster Team") {
                continue;
            }
            let recipientKey = await utils.getUserKeyByUsername(chatData.name);
            if (recipientKey === undefined) {
                return undefined;
            }
            let recipient = await utils.getUserByKey(recipientKey);
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

export async function isClearConnection(currentUserUsername, otherUserUsername) {
    const chatKey = await getChatKey([currentUserUsername, otherUserUsername]);
    const currentUser = await utils.getCurrentUserData();
    const otherUserKey = await utils.getUserKeyByUsername(otherUserUsername);
    const otherUser = await utils.getUserByKey(otherUserKey);
    return ((currentUser.chats[`${chatKey}`] === true) && (otherUser.chats[`${chatKey}`] === true));
}

// Accept chat request
export async function acceptChatRequest(username, profile_picture, currentUserKey) {
    const currentUser = await utils.getCurrentUserData();
    const chatKey = await getChatKey([username, currentUser.username]);
    var newChats = currentUser.chats;
    newChats[`${chatKey}`] = true;
    const updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);
}

// Decline chat request
export async function declineChatRequest(username, profile_picture, currentUserKey) {
    const currentUser = await utils.getCurrentUserData();
    const chatKey = await getChatKey([username, currentUser.username]);
    var newChats = currentUser.chats;
    delete newChats[`${chatKey}`];
    var updates = {};
    updates["users/" + currentUserKey + "/chats/"] = newChats;
    update(ref(database), updates);

    const userKey = await utils.getUserKeyByUsername(username);
    const user = await utils.getUserByKey(userKey);
    newChats = user.chats;
    delete newChats[`${chatKey}`];
    updates["users/" + userKey + "/chats/"] = newChats;
    update(ref(database), updates);

    const chats = await getChats();
    newChats = chats;
    delete chats[`${chatKey}`];
    updates["/chats/"] = newChats;
    update(ref(database), updates);
}

// Load chat room after clicking a chat tab in Messages
export async function loadChatRoomFromChatTab(recipientUsername) {
    let recipientKey = await utils.getUserKeyByUsername(recipientUsername);
    let recipient = await utils.getUserByKey(recipientKey);
    let currentUser = await utils.getCurrentUserData();
    var chatKey;
    for (var i in currentUser.chats) {
        if (containsElement(currentUser.chats[i], recipient.chats) === true) {
            chatKey = currentUser.chats[i];
        }
    }
    if (chatKey === undefined) {
        // console.log("Error msg: Couldn't find chat!");
        return undefined;
    }
    let currentUserKey = Object.keys(currentUser.contacts)[0];
    loadChatRoom(recipientKey, recipientUsername, currentUserKey);
}

// Messages
// const currentChatKey = JSON.parse(sessionStorage.getItem("current-chat-key"));
// const msgsRef = ref(database, "chats/" + currentChatKey + "/messages/");
// const messageInputElement = document.getElementById('message-input');
// // const sendMessageBtnElement = document.getElementById('send-message-btn');
const chatRoomTitle = document.getElementById('chat-room-header');

// Load chat room data
export async function loadChatRoom(recipientKey, username, currentUserKey) {
    const recipient = await utils.getUserByKey(recipientKey);
    if (recipient == undefined) {
        console.log("Couldn't load chat room!");
        return undefined;
    }
    chatRoomTitle.innerHTML = `
    <div id="chat-room-header">
    <div>
        <img src="${recipient.profile_picture}" alt="user-profile-pic"
            id="user-profile-pic-chat" />
    </div>
    <div id="chat-room-name">
        <span>${recipient.username}</span>
    </div>
    <div>
    </div>
    `;
    let currentUser = await utils.getCurrentUserData();
    var chatKey;
    for (var i in currentUser.chats) {
        if (containsElement(currentUser.chats[i], recipient.chats) === true) {
            chatKey = currentUser.chats[i];
            sessionStorage.setItem("current-chat-key", JSON.stringify(chatKey));
            return undefined;
        }
    }
    if (chatKey === undefined) {
        // console.log("Error msg: Couldn't find chat!");
        return undefined;
    }
    sessionStorage.setItem("current-chat-key", JSON.stringify(chatKey));
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
//                 const currentUserPromise = utils.getCurrentUserData(); // async&&await?
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
// // const currentUserKeyPromise = utils.getCurrentUserKey();
// // currentUserKeyPromise.then(function (key) {
// //     const currentUserPromise = utils.getCurrentUserData(); // await?
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
//     const userPromise = utils.getUserByKey(recipientKey); // async&&await?
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
// //     const currentUserPromise = utils.getCurrentUserData(); // await?
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
//     const currentUserPromise = utils.getCurrentUserData();
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
//     const currentUserPromise = utils.getCurrentUserData();
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
//     const currentUserPromise = utils.getCurrentUserData(); //await?
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