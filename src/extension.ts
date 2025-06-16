import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('webviewSidebar', {
      resolveWebviewView(webviewView) {
        webviewView.webview.options = {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, 'media'),
            vscode.Uri.joinPath(context.extensionUri, 'resources')
          ]
        };

        const jsUri = webviewView.webview.asWebviewUri(
          vscode.Uri.joinPath(context.extensionUri, 'media', 'main.js')
        );

        webviewView.webview.html = `
          <!DOCTYPE html>
          <html lang="ru">
          <head><meta charset="UTF-8"></head>
          <body>
            <button id="btn">Нажми меня</button>
            <script src="${jsUri}"></script>
          </body>
          </html>
        `;
      }
    })
  );
}
