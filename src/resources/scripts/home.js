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

        addCopyButtons();
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

function addCopyButtons() {
    const codeBlocks = document.querySelectorAll('.message pre code');
  
    codeBlocks.forEach((codeBlock) => {
      const pre = codeBlock.parentNode;
      pre.style.position = 'relative';
  
      const btn = document.createElement('button');
      btn.textContent = 'Copy';
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
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = 'Copy'), 1500);
        } catch {
          btn.textContent = 'Failed';
          setTimeout(() => (btn.textContent = 'Copy'), 1500);
        }
      });
  
      pre.appendChild(btn);
    });
  }

    vscode.postMessage({ command: 'getToken' });