const vscode = acquireVsCodeApi();
let chatId = null;
let models = null;

const getHome = async () => {
    vscode.postMessage({
        type: "getHome",
        data: {
            chatId: chatId
        }
    });
};

const preparationToInsertMessages = () => {
    const messageContainerElm = document.querySelector("#messages-container");
    messageContainerElm.classList.remove("justify-content-center");
    messageContainerElm.classList.add("justify-content-start");
    messageContainerElm.innerHTML = "";
};

const switchChatButton = (isEnd) => {
    const sendMessageButton = document.querySelector("button#send-message");
    const stopStreamingButton = document.querySelector("button#stop-streaming");

    if(isEnd){
        sendMessageButton.classList.remove("d-none");
        stopStreamingButton.classList.add("d-none");
    }else{
        sendMessageButton.classList.add("d-none");
        stopStreamingButton.classList.remove("d-none");
    }
};

const insertModels = (lastMessageModel) => {
    const element = document.querySelector("select[name='models-select']");
    const buttonFile = document.querySelector("button#attach-file");
    element.innerHTML = "";

    models.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.name} ${item.isFree ? '(free)' : ''}`;
        option.selected = lastMessageModel ? lastMessageModel === item.id : item.isDefault;

        if(option.selected){
            buttonFile.classList = item.canInputFile ? "d-block" : "d-none";
        }

        element.appendChild(option);
    });
};

const insertMessages = (messages) => {
    const element = document.querySelector("#messages-container");

    if(messages){
        element.classList.remove("justify-content-center");
        element.classList.add("justify-content-start");
        element.innerHTML = "";

        messages.forEach(message => {
            appendMessage(message.content, message.role, message.files);
        });

        addCopyButtons();
        element.scrollTop = element.scrollHeight;
    }else{
        element.classList.remove("justify-content-start");
        element.innerHTML = "";

        const div = document.createElement("div");
        div.innerText = "Список сообщений пуст";
        div.className = "text-center";
        element.appendChild(div);
        element.classList.add("justify-content-center");
    }
};

const sendMessage = async () => {
    const message = document.querySelector("textarea[name='message']");
    const model = document.querySelector("select[name='models-select']");
    const fileInput = document.querySelector("#file-input");
    const fileListContainer = document.querySelector("#file-list");

    const files = await Promise.all(
        Array.from(fileInput.files).map(async file => {
            const content = await file.arrayBuffer();
            return {
                name: file.name,
                type: file.type,
                content: Array.from(new Uint8Array(content))
            };
        })
    );

    vscode.postMessage({
        type: "sendMessage",
        data: {
            chatId: chatId,
            message: message.value,
            files: files,
            model: model.value
        }
    });

    message.value = "";
    fileInput.value = "";
    fileListContainer.innerText = "";
};

const stopStreaming = () => {
    switchChatButton(true);

    vscode.postMessage({
        type: "stopStreaming",
        data: {
            chatId: chatId
        } 
    });
};

const appendMessage = (message, role, files) => {
    const messageContainerElm = document.querySelector("#messages-container");

    const div = document.createElement("div");

    div.innerHTML = marked.parse(message);
    div.className = `message ${role}`;

    if(files && files.length > 0){
        const fileListDiv = document.createElement("div");
        const line = document.createElement("hr");

        fileListDiv.className = "d-flex flex-wrap pb-1";

        files.forEach(file => {
            const itemDiv = document.createElement("div");
            itemDiv.innerText = file.name;
            itemDiv.id = file.id;

            fileListDiv.appendChild(itemDiv);
        });

        div.appendChild(line);
        div.appendChild(fileListDiv);
    }

    messageContainerElm.appendChild(div);
};

function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.message pre code');
  
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentNode;
      pre.style.position = 'relative';
  
      const btn = document.createElement('button');
      btn.textContent = 'Копировать';
      btn.setAttribute('aria-label', 'Copy code');
      btn.style.position = 'absolute';
      btn.style.top = '4px';
      btn.style.right = '4px';
      btn.style.padding = '2px 6px';
      btn.style.fontSize = '10px';
      btn.style.cursor = 'pointer';
      btn.style.borderRadius = '3px';
      btn.style.backgroundColor = 'var(--vscode-editor-background)';
      btn.style.border = '1px solid var(--vscode-panel-border)';
      btn.style.color = 'var(--vscode-editor-foreground)';
      btn.style.boxShadow = '0 0 4px rgba(0,0,0,0.3)';
      btn.style.opacity = '0';
      btn.style.transition = 'opacity 0.3s ease';
      btn.style.zIndex = '10';
      btn.style.userSelect = 'none';
  
      pre.addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
      });
      pre.addEventListener('mouseleave', () => {
        btn.style.opacity = '0';
      });
  
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeBlock.innerText);
          btn.textContent = 'Скопировано!';
          setTimeout(() => (btn.textContent = 'Копировать'), 1500);
        } catch {
          btn.textContent = 'Ошибка';
          setTimeout(() => (btn.textContent = 'Копировать'), 1500);
        }
      });
  
      pre.appendChild(btn);
    });
}

document.querySelector("#send-message")?.addEventListener("click", sendMessage);
document.querySelector("#stop-streaming")?.addEventListener("click", stopStreaming);
document.querySelector("textarea[name='message']")?.addEventListener("keydown", async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        await sendMessage();
      }
});

window.addEventListener('message', async event => {
    const type = event.data.type;
    const message = event.data.data;

    switch(type){
        case "getHomeResult":
            if(message){
                chatId = message.chatId;
                models = message.models;
                const lastMessage = message.messages ? message.messages[message.messages.length -1] : null;

                insertModels(lastMessage?.model);
                insertMessages(message.messages);
            }
            break;
        case "explainCode":
            const rawCode = message.content;

            const safeMarkdown = [
              "Объясни этот код",
              "",
              "~~~~",
              rawCode,
              "~~~~"
            ].join("\n");

            vscode.postMessage({
                type: "explainCode",
                data: {
                    message: safeMarkdown
                }
            });
            break;
        case "updateChatId":
            chatId = message.chatId;
            preparationToInsertMessages();
            break;
        case "putMessage":
            if(chatId === message.chatId){
                switchChatButton(message.isEnd);
                putMessage(message.message, message.role, message.files);

                if(message.isEnd){
                    await getHome();
                }
            }
            break;
    }
});

const putMessage = (message, role, files) => {
    const messageContainerElm = document.querySelector("#messages-container");
    const messages = messageContainerElm.querySelectorAll("div.message");

    if(messages.length === 0){
        preparationToInsertMessages();
    }

    const lastMessage = messages?.[messages.length - 1];

    if(lastMessage?.classList.contains(role)){
            lastMessage.innerHTML = marked.parse(message);
    } else {
        appendMessage(message, role, files);
    }
};

document.getElementById("login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        type: "loginOut"
    });
});

document.querySelector("#chat-list")?.addEventListener("click", () => {
    vscode.postMessage({
        type: "getChatList"
    });
});

document.querySelector("#new-chat")?.addEventListener("click", async () => {
    chatId = null;

    await getHome();
});

document.querySelector("#attach-file").addEventListener("click", () => {
    document.querySelector("#file-input").click();
});

document.querySelector("#file-input").addEventListener("change", (event) => {
    const fileListContainer = document.querySelector("#file-list");

    if(!fileListContainer){
        return;
    }

    fileListContainer.innerText = "";

    Array.from(event.target.files).forEach(file => {
        const item = document.createElement("div");
        item.innerText = file.name;
        item.className = "me-2";

        fileListContainer.appendChild(item);
    });
});

document.querySelector("select[name='models-select']").addEventListener("change", (event) => {
    const target = event.target;
    const model = models?.find(x => x.id === target.value);
    const buttonFile = document.querySelector("button#attach-file");
    const inputFile = document.querySelector("input#file-input");
    const fileListContainer = document.querySelector("#file-list");

    if(!model?.canInputFile){
        buttonFile.classList = "d-none";
        fileListContainer.innerText = "";
    }else{
        inputFile.value = "";
        buttonFile.classList = "d-block me-2";
    }
});