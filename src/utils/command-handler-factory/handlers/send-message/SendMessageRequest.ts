export type SendMessageRequest = {
    chatId: string,
    model: string,
    message: string,
    files: {
        name: string,
        type: string,
        content: ArrayBuffer[]
    }[]
}