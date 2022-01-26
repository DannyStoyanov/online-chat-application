const friendListElement=document.getElementById('friend-list-wrapper');
const chatListElement=document.getElementById('chat-list-wrapper');
const chatListButtonElement=document.getElementById('open-chat-list-btn');
const friendListButtonElement=document.getElementById('open-friend-list-btn');
const logOutButtonElement=document.getElementById('log-out-btn');

// Default onload page state
window.addEventListener('load', (event) => {
    friendListElement.classList.add('hidden');
    friendListButtonElement.classList.remove('active-menu-option');
    chatListButtonElement.classList.add('active-menu-option');

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