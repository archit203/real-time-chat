import {z} from 'zod';

export enum SUPPORTED_MESSAGE_TYPES {
    JOIN_ROOM = 'JOIN_ROOM',
    SEND_MESSAGE = 'SEND_MESSAGE',
    UPVOTE_MESSAGE = 'UPVOTE_MESSAGE',
}

export type IncomingMessage = {
    type: SUPPORTED_MESSAGE_TYPES.JOIN_ROOM,
    payload: InitMessageType
} | {
    type: SUPPORTED_MESSAGE_TYPES.SEND_MESSAGE,
    payload: UserMessageType
} | {
    type: SUPPORTED_MESSAGE_TYPES.UPVOTE_MESSAGE,
    payload: UpVoteMessageType
}

export const InitMessage = z.object({
    name: z.string(),
    userId: z.string(),
    roomId: z.string(),
})

export type InitMessageType = z.infer<typeof InitMessage>;

export const UserMessage = z.object({
    userId: z.string(),
    message: z.string(),
    roomId: z.string(),
});

export type UserMessageType = z.infer<typeof UserMessage>;

export const UpvoteMessage = z.object({
    userId: z.string(),
    roomId: z.string(),
    chatId: z.string(),
});

export type UpVoteMessageType = z.infer<typeof UpvoteMessage>; 