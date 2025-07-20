const vscode = acquireVsCodeApi();

document.querySelector("#login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        type: "loginOut"
    });
});

document.querySelector("#home")?.addEventListener("click", () => goHome(null));

window.addEventListener("message", async event => {
    const message = event.data;

    if (message.type === 'getChatListResult') {
        if(message?.data?.chats){
            insertChatList(message.data.chats);
        }
    }
});

const goHome = (chatId) => {
    vscode.postMessage({
        type: "getHome",
        data: {
            chatId: chatId
        }
    });
};

const insertChatList = (chats) => {
    const chatListContainer = document.querySelector("#chat-list-container");
    const homeIconPath = document.querySelector("button#home img")?.src;
    chatListContainer.innerHTML = "";

    chats.forEach(item => {
        const chatItem = document.createElement("div");
        chatItem.classList = "chat-item";
        chatItem.id = item.id;
        chatItem.addEventListener("click", () => {
            goHome(item.id);
        });

        const label = document.createElement("div");
        label.innerHTML = item.title;
        label.classList = "w-100";

        const button = document.createElement("button");
        const icon = document.createElement("img");
        icon.src = homeIconPath.replace("plus-lg.svg", "trash.svg");
        button.appendChild(icon);
        button.addEventListener("click", (event) => {
            event.stopPropagation();

            vscode.postMessage({
                type: "deleteChat",
                chatId: event.currentTarget.parentElement.id
            });
        });

        chatItem.appendChild(label);
        chatItem.appendChild(button);
        chatListContainer.appendChild(chatItem);
    });
};

vscode.postMessage({ type: 'getChatList' });