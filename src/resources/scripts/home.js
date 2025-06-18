const vscode = acquireVsCodeApi();

document.getElementById("login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "login-out"
    });
});

window.addEventListener('message', async event => {
    const message = event.data;
    if (message.command === 'token') {
        jwtToken = message.token;

        await fetch("https://gptmix.ru/api/v1/plugins", {
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

    }else{
        const div = document.createElement("div");
        div.innerText = "Список сообщений пуст";
        div.className = "text-center";
        element.appendChild(div);
        element.classList.add("justify-content-center");
    }
};

vscode.postMessage({ command: 'getToken' });