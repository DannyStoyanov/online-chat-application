const friendListElement=document.getElementById('friend-list-wrapper');
const chatListElement=document.getElementById('chat-list-wrapper');
const chatListButtonElement=document.getElementById('open-chat-list-btn');
const friendListButtonElement=document.getElementById('open-friend-list-btn');

// Default onload page state
window.addEventListener('load', (event) => {
    friendListElement.classList.add('hidden');
    // chatListElement.classList.add("hidden");
});

chatListButtonElement.addEventListener('click', (event) => {
    chatListElement.classList.remove('hidden');
    friendListElement.classList.add('hidden');
});

friendListButtonElement.addEventListener('click', (event) => {
    friendListElement.classList.remove('hidden');
    chatListElement.classList.add('hidden');
});