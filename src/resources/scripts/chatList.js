const vscode = acquireVsCodeApi();
let jwtToken = null;

document.querySelector("#login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "loginOut"
    });
});

document.querySelector("#home")?.addEventListener("click", () => goHome(null));

window.addEventListener("message", async event => {
    const message = event.data;

    if (message.command === 'getChatList') {
        jwtToken = message.token;

        await getChatList();
    }
});

const goHome = (chatId) => {
    vscode.postMessage({
        command: "getHome",
        chatId: chatId
    });
};

const getChatList = async () => {
    const chatListContainer = document.querySelector("#chat-list-container");

    await fetch("https://gptmix.ru/api/v1/chats", {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + jwtToken
        }
    })
    .then(async response => {
        if(response.ok){
            await response.json().then(data => {
                data.chats.forEach(item => {
                    const chatItem = document.createElement("span");
                    chatItem.classList = "chat-item";
                    chatItem.id = item.id;
                    chatItem.innerHTML = item.title;
                    chatItem.addEventListener("click", () => {
                        goHome(item.id);
                    });
                    chatListContainer.appendChild(chatItem);
                });
            });
        }
    });
};

vscode.postMessage({ command: 'getChatList' });