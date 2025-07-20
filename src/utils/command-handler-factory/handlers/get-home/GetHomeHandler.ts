import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { ChatManager } from "../../../chat-manager/ChatManager";
import { getHomeHtml } from "../../../../web-view/home";
import { GetHomeRequest } from "./GetHomeRequest";

export class GetHomeHandler implements ICommandHandler{
    async handle(request: GetHomeRequest, context: ExtensionContext, webview: Webview) {
        const chatManager = new ChatManager();
        const token = await context.secrets.get("token");

        webview.html = await getHomeHtml(context, webview);
        const result = await chatManager.getChatAsync(request.chatId, token);

        if(result){
            webview.postMessage({
                type: "getHomeResult",
                data: {
                    chatId: request.chatId,
                    messages: result.messages,
                    models: result.models
                }
            });
        }
    }
    
}