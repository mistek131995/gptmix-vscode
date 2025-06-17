const vscode = acquireVsCodeApi();

const submitLoginInForm = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const token = formData.get('token');

    if(token){
        vscode.postMessage({
            command: "login-success",
            token: token
        });
    }
};

document.getElementById("login-in-form").addEventListener("submit", submitLoginInForm);