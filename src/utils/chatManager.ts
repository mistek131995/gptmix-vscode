import { getAsync, postAsync, postWithStreamingAsync } from "./fetchClient";

type Chat = {
    abortController?: AbortController,
    question?: string,
    answer?: string
}

export class ChatManager{
    private chats: Map<string, Chat> = new Map<string, Chat>();

    async createChatAsync(message: string, token: string, model: string | null = null) : Promise<string>{
        var chatId = await postAsync("/api/v1/chats", {
            message: message,
            isExplain: model === null
        }, token);

        this.chats.set(chatId, {});

        return chatId;
    }

    async sendMessageAsync(chatId: string, message: string, token: string, 
        onChunkCallback: (chunk: string, role: string, isEnd: boolean) => void, model: string | null = null)
    {
        let chat = this.chats.get(chatId);

        if(!chat){
            chat = {};
            this.chats.set(chatId, chat);
        }

        chat.question = message;

        //Отправляем сообщение пользователя для рендера
        onChunkCallback(chat.question, "user", true);

        const onChunk = (message: string, isEnd: boolean) => {
            chat.answer = (chat.answer || "") + message;

            onChunkCallback(chat.answer, "assistant", isEnd);

            if(isEnd){
                chat.answer = undefined;
                chat.question = undefined;

                return;
            }
        };

        chat.abortController = new AbortController();
        await postWithStreamingAsync("/api/v1/chats/messages", {
            chatId: chatId,
            message: message,
            isExplain: model === null
        }, token, onChunk, chat.abortController);
    }

    async getChatAsync(chatId: string | undefined, token: string) : Promise<any>{
        return await getAsync(`/api/v1/plugins${chatId ? `/${chatId}` : ''}`, token);
    }

    removeChatAsync(){

    }

    abortStreaming(chatId: string){
        const chat = this.chats.get(chatId);

        if(chat){
            chat.abortController?.abort();
        }
    }
}