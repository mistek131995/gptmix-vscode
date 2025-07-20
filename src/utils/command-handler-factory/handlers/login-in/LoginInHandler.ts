import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { LoginInRequest } from "./LoginInRequest";
import { host } from "../../../fetchClient";
import * as vscode from "vscode";
import { getChatListHtml } from "../../../../web-view/chatList";

export class LoginInHandler implements ICommandHandler{
    async handle(request: LoginInRequest, context: ExtensionContext, webview: Webview): Promise<void> { 

        await fetch(`${host}/api/v1/users/api-tokens/jwt`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                token: request.token
            })
        }).then(async response => {
            if(response.ok){
                const jwtToken = await response.text();
                context.secrets.store("token", jwtToken);
                webview.html = await getChatListHtml(context, webview);
                return;
            }

            vscode.commands.executeCommand("mixgpt.httperror", response);
        });
    }
}