const vscode = acquireVsCodeApi();

const submitLoginInForm = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const token = formData.get('token');

    await fetch("https://mixgpt.ru/api/v1/users/api-tokens/jwt", {
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
        } else {
            const content = await response.json();

            vscode.postMessage({
                command: "apiError",
                code: response.status,
                message: content.message
            });
        }
    });
};

document.getElementById("login-in-form")?.addEventListener("submit", submitLoginInForm);