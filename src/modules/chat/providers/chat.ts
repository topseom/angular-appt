import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { QueryService,AuthService,Options,InsertService,Query,UpdateService } from 'ng-prov';
import { table } from './interface';

import { LoadingController } from 'ionic-angular';

//import { StorageService,SiteService } from '../../../providers';
import { ChatAlertService } from './alert';

import 'rxjs/add/operator/map';
import * as firebase from 'firebase';


@Injectable()
export class ChatDataService{
  private spinner = {
    spinner: 'circles'
  };
  private loading;
  constructor(
    public _auth:AuthService,
    public _update:UpdateService,
    public _insert:InsertService,
    public _alert:ChatAlertService,
    public _query:QueryService,
    public loadingController: LoadingController){}

  // Get all users
  async getUsers(realtime=false) {
    return <Observable<any>> await 
    this._query.query(table.accounts,new Options({
      realtime,
      orderBy:'name'
    }));
  }

  async createUserData(){
      let user = <any> await this._auth.getUser();
      let account = await this._query.query(table.accounts+'/'+user.id,new Options({type:'object'}));
      if(!account){
         this.loadingShow();
         var userId, username, img, email,description;
         userId = user.id;
         if(user.image){
            img = user.image;
         }else{
            img = "assets/img/theme/chat/theme1/profile.png";
         }
         email = user.email;
         username = user.username;
         description = "I'm Available for chat";
         try{
          await this._insert.db(new Query(table.accounts,new Options({ loading:false,method:"post",
            data:{
              id: userId,
              name: username,
              username: username,
              img: img,
              email: email,
              description: description,
              dateCreated: new Date().toString()
            }}
          )))
          this.loadingHide();
          return 1;
         }catch(err){
          this.loadingHide();
          return Promise.reject(err);
         }
      }else{
        return 1;
      }
  }

  async getUserWithUsername(username) {
    return <Observable<any>> await 
    this._query.query(table.accounts,new Options({
      realtime:true,
      where:[{key:'username',value:username }]
    }))
  }

  async getCurrentUser() {
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+user.id,new Options({
      realtime:true,
      type:'object'
    }))
  }

  async getUser(userId="",realtime=false) {
    let user = await this._auth.getUser();
    if(userId){
      user.id = userId;
    }
    return <any> await
    this._query.query(table.accounts+'/'+user.id,new Options({
      realtime,
      type:'object'
    }))
  }

  async getRequests(userId="",realtime=false) {
    let user = await this._auth.getUser();
    if(userId){
      user.id = userId;
    }
    return <any> await
    this._query.query(table.requests+'/'+user.id,new Options({
      realtime,
      type:'object'
    }))
  }

  async getFriendRequests(userId) {
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.requests+'/'+user.id,new Options({
      realtime:true,
      where:[{key:'receiver',value:userId}]
    }))
  }

  async getAccountsConversationUser(userId){
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+user.id+'/'+table.conversations+'/'+userId,new Options({
      realtime:true,
      type:'object'
    }))
  }

  async updateAccountsConversationUser(userId,data){
    let user = await this._auth.getUser();
    return <any> await
    this._update.db(new Query(table.accounts+'/'+user.id+'/'+table.conversations,new Options({ data:{...data,id:userId},loading:false })));
  }
  
  async getAccountsConversationUserSender(userId){
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+userId+'/'+table.conversations+'/'+user.id,new Options({
      realtime:true,
      type:'object'
    }))
  }

  async updateAccountsConversationUserSender(userId,data){
    let user = await this._auth.getUser();
    return <any> await
    this._update.db(new Query(table.accounts+'/'+userId+'/'+table.conversations,new Options({ data:{...data,id:user.id},loading:false })));
  }

  // Get conversation given the conversationId.
  async getConversation(conversationId) {
    return <Observable<any>> await
    this._query.query(table.conversations+'/'+conversationId,new Options({
      realtime:true,
      type:'object'
    }))
  }

  async updateConversation(conversationId,data){
    let user = await this._auth.getUser();
    return <any> await
    this._update.db(new Query(table.conversations+'/'+conversationId,new Options({ data:data,loading:false })));
  }

  // Get conversations of the current logged in user.
  async getConversations() {
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+user.id+'/'+table.conversations,new Options({
      realtime:true
    }));
  }

  async getConversationsAll() {
    return <Observable<any>> await
    this._query.query(table.conversations,new Options({
      realtime:true
    }));
  }

  async insertConversationsAll(data){
    return <any> await
    this._insert.db(new Query(table.conversations,new Options({method:'push',data:data})))
  }


  // Get messages of the conversation given the Id.
  async getConversationMessages(conversationId) {
    return <Observable<any>> await
    this._query.query(table.conversations+'/'+conversationId+'/'+table.messages,new Options({
      realtime:true,
      type:"object"
    }));
  }

  // Get messages of the group given the Id.
  async getGroupMessages(groupId) {
    return <Observable<any>> await
    this._query.query(table.groups+'/'+groupId+'/'+table.messages,new Options({
      realtime:true,
      type:"object"
    }));
  }

  // Get groups of the logged in user.
  async getGroups() {
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+user.id+'/'+table.groups,new Options({
      realtime:true
    }));
  }

  // Get group info given the groupId.
  async getGroup(groupId) {
    return <Observable<any>> await
    this._query.query(table.groups+'/'+groupId,new Options({
      realtime:true,
      type:"object"
    }));
  }

   // Send friend request to userId.
  async sendFriendRequest(userId) {
    let user = await this._auth.getUser();
    let loggedInUserId = user.id;
    this.loadingShow();
    let requestsSent = [];
    try{
      let requests = await this.getRequests(loggedInUserId);
      requestsSent = requests?requests.requestsSent:false ;
      if (!requestsSent) {
        requestsSent = [userId];
      } else {
        if(requestsSent.indexOf(userId) == -1)
          requestsSent.push(userId);
      }
      await this._update.db(new Query(table.requests,new Options({ loading:false,data:{id:loggedInUserId,requestsSent:requestsSent} })));
      var friendRequests;
      requests = await this.getRequests(userId);
      friendRequests = requests?requests.friendRequests:false;
      if (!friendRequests) {
        friendRequests = [loggedInUserId];
      } else {
        if(friendRequests.indexOf(userId) == -1)
          friendRequests.push(loggedInUserId);
      }
      await this._update.db(new Query(table.requests,new Options({ loading:false,data:{id:userId,friendRequests:friendRequests} })));
      this.loadingHide();
      this._alert.showFriendRequestSent();
      return 1;
    }catch(err){
      this.loadingHide();
      return Promise.reject(err);
    }
  }

  // Cancel friend request sent to userId.
  async cancelFriendRequest(userId) {
    let user = await this._auth.getUser();
    let loggedInUserId = user.id;
    this.loadingShow();
    var requestsSent;
    try{
      let requests = await this.getRequests(loggedInUserId);
      requestsSent = requests?requests.requestsSent:false;
      requestsSent.splice(requestsSent.indexOf(userId), 1);
      await this._update.db(new Query(table.requests,new Options({ loading:false,data:{id:loggedInUserId,requestsSent:requestsSent} })));
      var friendRequests;

      requests = await this.getRequests(userId);
      friendRequests = requests?requests.friendRequests:false;
      friendRequests.splice(friendRequests.indexOf(loggedInUserId), 1);
      await this._update.db(new Query(table.requests,new Options({ loading:false,data:{id:userId,friendRequests:friendRequests} })));
      this.loadingHide();
      this._alert.showFriendRequestRemoved();
      return 1;
    }catch(err){
      this.loadingHide();
      return Promise.reject(err);
    }
  }

  // Delete friend request.
  async deleteFriendRequest(userId) {
    let user = await this._auth.getUser();
    let loggedInUserId = user.id;
    this.loadingShow();
    var friendRequests;
    try{
      let requests = await this.getRequests(loggedInUserId);
      friendRequests = requests?requests.friendRequests:false;
      friendRequests.splice(friendRequests.indexOf(userId), 1);
      await this._update.db(new Query(table.requests,new Options({data:{ id:loggedInUserId,friendRequests: friendRequests } })));
      
      requests = await this.getRequests(userId);
      let requestsSent = requests?requests.requestsSent:false;
      requestsSent.splice(requestsSent.indexOf(loggedInUserId), 1);
      await this._update.db(new Query(table.requests,new Options({data:{ id:userId,requestsSent: requestsSent } })));
      this.loadingHide();
      return 1;
    }catch(err){
      this.loadingHide();
      return Promise.reject(err);
    }
  }

  // Accept friend request.
  async acceptFriendRequest(userId) {
    let user = await this._auth.getUser();
    let loggedInUserId = user.id;
    await this.deleteFriendRequest(userId);
    this.loadingShow();
    try{
      let account = await this.getUser(loggedInUserId);
      var friends = account?account.friends:false;
      if (!friends) {
        friends = [userId];
      } else {
        friends.push(userId);
      }
      await this._update.db(new Query(table.accounts,new Options({ data:{id:loggedInUserId,friends:friends} })));
      
      account = await this.getUser(userId);
      var friends = account?account.friends:false;
      if (!friends) {
        friends = [loggedInUserId];
      } else {
        friends.push(loggedInUserId);
      }
      await this._update.db(new Query(table.accounts,new Options({ data:{id:userId,friends:friends} })));
      this.loadingHide();
      return 1;
    }catch(err){
      this.loadingHide();
      return Promise.reject(err);
    }
    // DO AT HERE  
  }

  //Loading
  loadingShow() {
    if (!this.loading) {
      this.loading = this.loadingController.create(this.spinner);
      this.loading.present();
    }
  }
  //Hide loading
  loadingHide() {
    if (this.loading) {
      this.loading.dismiss();
      this.loading = null;
    }
  }
}


