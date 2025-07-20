import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { ChatManager } from "../../../chat-manager/ChatManager";
import { getChatListHtml } from "../../../../web-view/chatList";

export class GetChatListHandler implements ICommandHandler{
    async handle(request: any, context: ExtensionContext, webview: Webview) {
        const chatManager = new ChatManager();
        const token = await context.secrets.get("token");

        webview.html = await getChatListHtml(context, webview);

        webview.postMessage({ 
            type: "getChatListResult",
            data: await chatManager.getChatList(token)
        });
    }  
}