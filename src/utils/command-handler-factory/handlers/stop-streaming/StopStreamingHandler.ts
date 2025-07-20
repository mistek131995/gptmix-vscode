import { ExtensionContext, Webview } from "vscode";
import { ICommandHandler } from "../../ICommandHandler";
import { StopStreamingRequest } from "./StopStreamingRequest";
import { ChatManager } from "../../../chat-manager/ChatManager";

export class StopStreamingHandler implements ICommandHandler{
    async handle(request: StopStreamingRequest, context: ExtensionContext, webview: Webview) {
        const chatManager = new ChatManager();
        chatManager.abortStreaming(request.chatId);
    }
}