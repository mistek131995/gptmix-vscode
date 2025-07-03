const vscode = acquireVsCodeApi();

document.querySelector("#login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "loginOut"
    });
});

document.querySelector("#home")?.addEventListener("click", () => goHome(null));

window.addEventListener("message", async event => {
    const message = event.data;

    if (message.command === 'getChatListResult') {
        if(message?.data?.chats){
            insertChatList(message.data.chats);
        }
    }
});

const goHome = (chatId) => {
    vscode.postMessage({
        command: "getHome",
        chatId: chatId
    });
};

const insertChatList = (chats) => {
    const chatListContainer = document.querySelector("#chat-list-container");
    chatListContainer.innerHTML = "";

    chats.forEach(item => {
        const chatItem = document.createElement("span");
        chatItem.classList = "chat-item";
        chatItem.id = item.id;
        chatItem.innerHTML = item.title;
        chatItem.addEventListener("click", () => {
            goHome(item.id);
        });
        chatListContainer.appendChild(chatItem);
    });
};

vscode.postMessage({ command: 'getChatList' });