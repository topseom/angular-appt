import * as moment_ from 'moment';
const moment = moment_;
import { Injectable, Pipe, PipeTransform} from '@angular/core';

  @Pipe({
    name: 'chatConversationFilter'
  })
  @Injectable()
  export class ChatConversationPipe implements PipeTransform {
    transform(conversations: any[], search: string): any {
      if (!conversations) {
        return;
      } else if (!search) {
        return conversations;
      } else {
        let term = search.toLowerCase();
        return conversations.filter(conversation => conversation.friend.name.toLowerCase().indexOf(term) > -1 || conversation.friend.username.toLowerCase().indexOf(term) > -1);
      }
    }
  }
  @Pipe({
    name: 'chatDateFormat'
  })
  @Injectable()
  export class ChatDateFormatPipe implements PipeTransform {
    transform(date: any, args?: any): any {
      return moment(new Date(date)).fromNow();
    }
  }
  @Pipe({
    name: 'chatGroupFilter'
  })
  @Injectable()
  export class ChatGroupPipe implements PipeTransform {
    transform(groups: any[], search: string): any {
      if (!groups) {
        return;
      } else if (!search) {
        return groups;
      } else {
        let term = search.toLowerCase();
        return groups.filter(group => group.name.toLowerCase().indexOf(term) > -1);
      }
    }
  }
  @Pipe({
    name: 'chatFriendFilter'
  })
  @Injectable()
  export class ChatFriendPipe implements PipeTransform {
    transform(friends: any[], search: string): any {
      if (!friends) {
        return;
      } else if (!search) {
        return friends;
      } else {
        let term = search.toLowerCase();
        return friends.filter(friend => friend.name.toLowerCase().indexOf(term) > -1 || friend.username.toLowerCase().indexOf(term) > -1);
      }
    }
  }
  
  @Pipe({
    name: 'chatSearchFilter'
  })
  @Injectable()
  export class ChatSearchPipe implements PipeTransform {
    // SearchPipe
    // Filter user search results for name or username excluding the excludedIds.
    transform(accounts: any[], data: [[any], any]): any {
      let excludedIds = data[0];
      var term: string = data[1];
      if (!accounts) {
        return;
      } else if (!excludedIds) {
        return accounts;
      } else if (excludedIds && !term) {
        return accounts.filter((account) => excludedIds.indexOf(account.userId) == -1);
      } else {
        term = term.toLowerCase();
        return accounts.filter((account) => excludedIds.indexOf(account.userId) == -1 && (account.name.toLowerCase().indexOf(term) > -1 || account.username.toLowerCase().indexOf(term) > -1));
      }
    }
  }