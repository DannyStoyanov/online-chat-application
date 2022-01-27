const friendListElement=document.getElementById('friend-list-wrapper');
const chatListElement=document.getElementById('chat-list-wrapper');
const chatListButtonElement=document.getElementById('open-chat-list-btn');
const friendListButtonElement=document.getElementById('open-friend-list-btn');
const logOutButtonElement=document.getElementById('log-out-btn');
const filterAllButtonElement=document.getElementById('filter-all-btn');
const filterUnreadButtonElement=document.getElementById('filter-unread-btn');
const filterGroupsButtonElement=document.getElementById('filter-groups-btn');

// Default onload page state
window.addEventListener('load', (event) => {
    friendListElement.classList.add('hidden');
    friendListButtonElement.classList.remove('active-menu-option');
    chatListButtonElement.classList.add('active-menu-option');

    // Chat default filter
    filterAllButtonElement.classList.add('current-filter');

    // chatListElement.classList.add("hidden");
    updateTitle();
});

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
    const appTitleElement=document.getElementById('listfield-title');
    if (chatListButtonElement.classList.contains('active-menu-option')===true) {
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
    window.location.href="index.html";
}

// Chat settings:

// Filter all messages
filterAllButtonElement.addEventListener('click',(event) => {
    filterAllButtonElement.classList.add('current-filter');
    filterUnreadButtonElement.classList.remove('current-filter');
    filterGroupsButtonElement.classList.remove('current-filter');
});

// Filter unread messages
filterUnreadButtonElement.addEventListener('click',(event) => {
    filterUnreadButtonElement.classList.add('current-filter');
    filterAllButtonElement.classList.remove('current-filter');
    filterGroupsButtonElement.classList.remove('current-filter');
});

// Filter groups messages
filterGroupsButtonElement.addEventListener('click',(event) => {
    filterGroupsButtonElement.classList.add('current-filter');
    filterAllButtonElement.classList.remove('current-filter');
    filterUnreadButtonElement.classList.remove('current-filter');
});