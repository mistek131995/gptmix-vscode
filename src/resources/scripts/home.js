const vscode = acquireVsCodeApi();

document.getElementById("login-out")?.addEventListener("click", () => {
    vscode.postMessage({
        command: "login-out"
    })
});