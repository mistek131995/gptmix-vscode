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
                type: "getHomeResult",
                data: {
                    chatId: undefined,
                    messages: result.messages,
                    models: result.models
                }
            });
        }

        //Возможно чат лучше создавать до перехода на WebView и передавать Id при переходе.
        const chatId = await chatManager.createChatAsync(request.message, token);
        webview.postMessage({
            type: "updateChatId",
            data: {
                chatId: chatId
            }
        });

        const onChunk = (message: string, role: string, isEnd: boolean) => {

            console.log(chatId);

            webview.postMessage({
                type: "putMessage",
                data: {
                    chatId: chatId,
                    message: message,
                    role: role,
                    isEnd: isEnd
                }
            });
        };

        console.log(chatId);
        
        await chatManager.sendMessageAsync(chatId, request.message, token, onChunk);
    }
}