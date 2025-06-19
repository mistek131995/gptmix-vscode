const vscode = acquireVsCodeApi();

const submitLoginInForm = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const token = formData.get('token');

    await fetch("https://gptmix.ru/api/v1/users/api-tokens/jwt", {
        method: "POST",
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify({
            token: token
        })
    }).then(async response => {
        if(response.ok){
            vscode.postMessage({
                command: "loginIn",
                token: await response.text()
            });
        }
    });
};

document.getElementById("login-in-form")?.addEventListener("submit", submitLoginInForm);