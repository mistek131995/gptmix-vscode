import * as vscode from 'vscode';

export const getChatListHtml = async (context: vscode.ExtensionContext, webviewView: vscode.Webview) => {
  const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'html', 'chatList.html');

  const cssUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'css', 'main.css')
  );

  const jsUri = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'scripts', 'chatList.js')
  );

  const loginOutIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'door-open.svg')
  );

  const newChatIcon = webviewView.asWebviewUri(
    vscode.Uri.joinPath(context.extensionUri, 'dist', 'resources', 'img', 'plus-lg.svg')
  );

  const htmlBytes = await vscode.workspace.fs.readFile(htmlPath);
  let htmlContent = Buffer.from(htmlBytes).toString('utf8');

  return htmlContent = htmlContent
  .replace(/{{cspSource}}/g, webviewView.cspSource)
  .replace(/{{cssUri}}/g, cssUri.toString())
  .replace(/{{jsUri}}/g, jsUri.toString())
  .replace(/{{loginOutIcon}}/g, loginOutIcon.toString())
  .replace(/{{newChatIcon}}/g, newChatIcon.toString());
};