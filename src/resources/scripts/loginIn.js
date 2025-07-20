const vscode = acquireVsCodeApi();

const submitLoginInForm = async (event) => {
    event.preventDefault();

    const tokenInput = document.querySelector("input[name='token']");

    vscode.postMessage({
        type: "loginIn",
        data: {
            token: tokenInput.value
        }
    });
};

document.getElementById("login-in-form")?.addEventListener("submit", submitLoginInForm);