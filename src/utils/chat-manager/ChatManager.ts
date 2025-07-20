import { deleteAsync, getAsync, postAsync, postWithStreamingAsync } from "../fetchClient";
import type {File} from "./models/File";

type Chat = {
    abortController?: AbortController,
    question?: string,
    answer?: string
}

export class ChatManager{
    private chats: Map<string, Chat> = new Map<string, Chat>();

    async createChatAsync(message: string, token: string | undefined, model: string | null = null) : Promise<string>{
        var chatId = await postAsync("/api/v1/chats", {
            message: message,
            isExplain: model === null
        }, token);

        this.chats.set(chatId, {});

        return chatId;
    }

    async sendMessageAsync(chatId: string, message: string, token: string | undefined, 
        onChunkCallback: (chunk: string, role: string, isEnd: boolean) => void, model: string | null = null, files: File[] = [])
    {
        let chat = this.chats.get(chatId);

        if(!chat){
            chat = {};
            this.chats.set(chatId, chat);
        }

        chat.question = message;

        //Отправляем сообщение пользователя для рендера
        onChunkCallback(chat.question, "user", false);

        const onChunk = (chunk: string, isEnd: boolean) => {
            const content = JSON.parse(chunk)?.choices?.[0]?.delta?.content;

            if(!content && !isEnd){
                return;
            }

            chat.answer = (chat.answer || "") + (content || "");
            onChunkCallback(chat.answer, "assistant", isEnd);

            if(isEnd){
                chat.answer = undefined;
                chat.question = undefined;
                chat.abortController = undefined;

                return;
            }
        };

        chat.abortController = new AbortController();

        const formData = new FormData();
        formData.append("chatId", chatId);
        formData.append("message", message);
        formData.append("model", model);
        formData.append("isExplain", model === null);

        files?.forEach(file => {
            formData.append("files", new Blob(file.content), file.name);
        });
        
        await postWithStreamingAsync("/api/v3/chats/messages", formData, token, onChunk, chat.abortController);
    }

    async getChatAsync(chatId: string | undefined, token: string|undefined) : Promise<any>
    {
        return await getAsync(`/api/v1/plugins${chatId ? `/${chatId}` : ''}`, token);
    }

    async getChatList(token: string|undefined) : Promise<any>
    {
        return await getAsync("/api/v1/chats", token);
    }

    async deleteChatAsync(chatId: string, token: string|undefined) : Promise<any>
    {
        return await deleteAsync(`/api/v1/chats/${chatId}`, token);
    }

    abortStreaming(chatId: string)
    {
        const chat = this.chats.get(chatId);

        if(chat){
            chat.abortController?.abort();
        }
    }
}