const vscode = acquireVsCodeApi();
let jwtToken = null;
let chatId = "01977c8b-e98e-740f-8c25-53f4155c5421";

document.getElementById("login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "login-out"
    });
});

window.addEventListener('message', async event => {
    const message = event.data;
    if (message.command === 'token') {
        jwtToken = message.token;

        await fetch(`https://gptmix.ru/api/v1/plugins${chatId ? `/${chatId}` : ''}`, {
        method: "GET",
        headers: {
            "content-type": "application/json",
            "authorization": "Bearer " + jwtToken
        }
        }).then(async response => {
        if(response.ok){
            response.json().then(data => {
                insertModels(data.models);
                insertMessages(data.messages);
            });
        }
        });
    }
});

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
        messages.forEach(message => {
            const div = document.createElement("div");
            div.innerHTML = marked.parse(message.content);
            div.className = `message ${message.role}`;
            element.appendChild(div);
        });
    }else{
        const div = document.createElement("div");
        div.innerText = "Список сообщений пуст";
        div.className = "text-center";
        element.appendChild(div);
        element.classList.add("justify-content-center");
    }
};

document.querySelector("#send-message")?.addEventListener("click", async () => {
    console.log(jwtToken);
});

vscode.postMessage({ command: 'getToken' });