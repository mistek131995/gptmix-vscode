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
    const homeIconPath = document.querySelector("button#home img")?.src;
    chatListContainer.innerHTML = "";

    chats.forEach(item => {
        const chatItem = document.createElement("div");
        chatItem.classList = "chat-item";

        const label = document.createElement("div");
        label.id = item.id;
        label.innerHTML = item.title;
        label.classList = "w-100";
        label.addEventListener("click", () => {
            goHome(item.id);
        });

        const button = document.createElement("button");
        const icon = document.createElement("img");
        icon.src = homeIconPath.replace("plus-lg.svg", "trash.svg");
        button.appendChild(icon);

        chatItem.appendChild(label);
        chatItem.appendChild(button);
        chatListContainer.appendChild(chatItem);
    });
};

vscode.postMessage({ command: 'getChatList' });