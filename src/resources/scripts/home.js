const vscode = acquireVsCodeApi();
let jwtToken = null;
let chatId = null;

let abortController = null;

const getHome = async () => {
    await fetch(`https://gptmix.ru/api/v1/plugins${chatId ? `/${chatId}` : ''}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + jwtToken
        }
    })
    .then(async response => {
        if(response.ok){
            response.json().then(data => {
                insertModels(data.models);
                insertMessages(data.messages);
            });
        }
    });
};

const insertModels = (models) => {
    const element = document.querySelector("select[name='models-select']");

    models.forEach(item => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = item.name;

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
            appendMessage(message.content, message.role);
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
    abortController = new AbortController();
    const messageElm = document.querySelector("textarea[name='message']");
    const messageContent = messageElm.value;
    messageElm.value = "";

    const modelSelectElm = document.querySelector("select[name='models-select']");
    const messageContainerElm = document.querySelector("#messages-container");

    const sendMessageBtn = document.querySelector("#send-message");
    const stopStreamingBtn = document.querySelector("#stop-streaming");

    if(messageElm && modelSelectElm){

        if(!chatId){
            chatId = await createChat(messageContent, modelSelectElm.value);
            
            messageContainerElm.classList.remove("justify-content-center");
            messageContainerElm.classList.add("justify-content-start");
            messageContainerElm.innerHTML = "";
        }

        appendMessage(messageContent, "user");
        appendMessage("", "assistant");

        sendMessageBtn.classList.add("d-none");
        stopStreamingBtn.classList.remove("d-none");
        messageContainerElm.scrollTop = messageContainerElm.scrollHeight;

        await fetch("https://gptmix.ru/api/v1/chats/messages", {
            method: "POST",
            signal: abortController.signal,
            headers: {
                "content-type": "application/json",
                "authorization": "Bearer " + jwtToken
            },
            body: JSON.stringify({
                chatId: chatId,
                message: messageContent,
                model: modelSelectElm.value
            })
        }).then(async response => {
            if (!response.body) {
                throw new Error('ReadableStream not supported in this environment.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            const messageContainerElm = document.querySelector("#messages-container");
            const lastMessage = messageContainerElm.children[messageContainerElm.children.length - 1];

            while (true) {
                const { done, value } = await reader.read();
                if (done){
                    break;
                }

        
                const chunk = decoder.decode(value, { stream: true });
                chunk.split('\n').forEach(line => {
                    if (line.startsWith('data:')) {
                        const message = line.replace('data: ', '');
                        lastMessage.innerHTML = marked.parse(lastMessage.innerHTML + message);
                    }
                });

                messageContainerElm.scrollTop = messageContainerElm.scrollHeight;
            }

            getHome();
        })
        .finally(() => {
            abortController = null;
            sendMessageBtn.classList.remove("d-none");
            stopStreamingBtn.classList.add("d-none");
        });
    }
};

const stopStreaming = () => {
    const sendMessageBtn = document.querySelector("#send-message");
    const stopStreamingBtn = document.querySelector("#stop-streaming");
    const messageContainerElm = document.querySelector("#messages-container");

    abortController?.abort();

    sendMessageBtn.classList.remove("d-none");
    stopStreamingBtn.classList.add("d-none");

    if (messageContainerElm?.lastElementChild) {
        messageContainerElm.removeChild(messageContainerElm.lastElementChild);
    }
};

const createChat = async (message, model) => {
    return await fetch("https://gptmix.ru/api/v1/chats", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + jwtToken
        },
        body: JSON.stringify({
            message: message,
            model: model
        })
    })
    .then(async response => {
        if(response.ok){
            return response.json();
        }
    });
};

const appendMessage = (message, role) => {
    const messageContainerElm = document.querySelector("#messages-container");

    const div = document.createElement("div");
    div.innerHTML = marked.parse(message);
    div.className = `message ${role}`;
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
    const message = event.data;

    if(message.command === "getHome"){
        chatId = message.chatId;
        jwtToken = message.token;

        await getHome();
    }
});

document.getElementById("login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "loginOut"
    });
});

document.querySelector("#chat-list")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "getChatList"
    });
});

document.querySelector("#new-chat")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "getHome",
        token: jwtToken,
        chatId: null
    });
});