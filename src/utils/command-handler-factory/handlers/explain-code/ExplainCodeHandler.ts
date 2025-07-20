import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { ExplainCodeRequest } from "./ExplainCodeRequest";
import { ChatManager } from "../../../chat-manager/ChatManager";

export class ExplainCodeHandler implements ICommandHandler{
    async handle(request: ExplainCodeRequest, context: ExtensionContext, webview: Webview) {
        const token = await context.secrets.get("token");
        const chatManager = new ChatManager();

        var result = await chatManager.getChatAsync(undefined, token);

        if(result){
            webview.postMessage({
                command: "getHomeResult",
                chatId: undefined,
                messages: result.messages,
                models: result.models
            });
        }

        const onChunk = (message: string, role: string, isEnd: boolean) => {
            webview.postMessage({
                command: "putMessage",
                message: message,
                role: role,
                isEnd: isEnd
            });
        };

        //Возможно чат лучше создавать до перехода на WebView и передавать Id при переходе.
        const chatId = await chatManager.createChatAsync(request.message, token);
        webview.postMessage({
            command: "updateChatId",
            chatId: chatId
        });


        await chatManager.sendMessageAsync(chatId, request.message, token, onChunk);
    }
}