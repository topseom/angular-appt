import { NgModule } from '@angular/core';
//import { CHAT_PROVIDERS } from './providers';
//import { CHAT_PIPES } from './pipes';

import { ChatAlertService } from './providers/alert';
import { ChatDataService } from './providers/chat';

import { ChatConversationPipe } from './pipes/pipes';
import { ChatDateFormatPipe } from './pipes/pipes';
import { ChatGroupPipe } from './pipes/pipes';
import { ChatFriendPipe } from './pipes/pipes'
import { ChatSearchPipe } from './pipes/pipes'

const PROVIDERS = [
    ChatAlertService,
    ChatDataService
]

const PIPES = [
    ChatConversationPipe,
    ChatDateFormatPipe,
    ChatGroupPipe,
    ChatFriendPipe,
    ChatSearchPipe
];

@NgModule({
    declarations:[
        PIPES
    ],
    exports:[
        PIPES
    ],
    providers:[
        PROVIDERS
    ]
})

export class ChatModule{}
