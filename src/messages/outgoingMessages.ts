export enum SUPPORTED_MESSAGE_TYPES {
    ADD_CHAT = 'ADD_CHAT',
    UPDATE_CHAT = 'UPDATE_CHAT',
}

type MessagePayload = {
    roomId: string;
    message: string;
    name: string;
    upvotes: number;
    chatId: string;
}

export type OutgoingMessage = {
    type: SUPPORTED_MESSAGE_TYPES.ADD_CHAT,
    payload: MessagePayload
} | {
    type: SUPPORTED_MESSAGE_TYPES.UPDATE_CHAT,
    payload: Partial<MessagePayload>
}
