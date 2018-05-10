import { ChatConversationPipe } from './pipes';
import { ChatDateFormatPipe } from './pipes';
import { ChatGroupPipe } from './pipes';
import { ChatFriendPipe } from './pipes'
import { ChatSearchPipe } from './pipes'

export const CHAT_PIPES = [
    ChatConversationPipe,
    ChatDateFormatPipe,
    ChatGroupPipe,
    ChatFriendPipe,
    ChatSearchPipe
]