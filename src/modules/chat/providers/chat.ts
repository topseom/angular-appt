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


  /*getSite(){
    return new Promise<any>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(site);
      });
    });
  }

  getUserCurent(){
     return new Promise<any>((resolve,reject)=>{
      this._site.getUser().then(user=>{
        resolve(user);
      });
    });
  }*/

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
         await this._insert.db(new Query(table.accounts,new Options({ loading:false,type:"post",
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
         return 1;
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
    return <any> await
    this._query.query(table.accounts+'/'+user.id,new Options({
      realtime,
      type:'object'
    }))
  }

  async getRequests(userId="",realtime=false) {
    let user = await this._auth.getUser();
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
  
  async getAccountsConversationUserSender(userId){
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+userId+'/'+table.conversations+'/'+user.id,new Options({
      realtime:true,
      type:'object'
    }))
   
  }

  // Get conversation given the conversationId.
  async getConversation(conversationId) {
    return <Observable<any>> await
    this._query.query(table.conversations+'/'+conversationId,new Options({
      realtime:true,
      type:'object'
    }))
  }

  // Get conversations of the current logged in user.
  async getConversations() {
    let user = await this._auth.getUser();
    return <Observable<any>> await
    this._query.query(table.accounts+'/'+user.id+'/'+table.conversations,new Options({
      realtime:true,
      type:'object'
    }));
  }

  async getConversationsAll() {
    return <Observable<any>> await
    this._query.query(table.conversations,new Options({
      realtime:true
    }));
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
    let requests = await this.getRequests(loggedInUserId);
    requestsSent = requests.requestsSent;
    if (!requestsSent) {
      requestsSent = [userId];
    } else {
      if(requestsSent.indexOf(userId) == -1)
        requestsSent.push(userId);
    }
    try{
      await this._update.db(new Query(table.requests+'/'+loggedInUserId,new Options({ loading:false,data:{requestsSent:requestsSent} })));
      var friendRequests;
      requests = await this.getRequests(userId);
      friendRequests = requests.friendRequests;
      if (!friendRequests) {
        friendRequests = [loggedInUserId];
      } else {
        if(friendRequests.indexOf(userId) == -1)
          friendRequests.push(loggedInUserId);
      }
      await this._update.db(new Query(table.requests+'/'+userId,new Options({ loading:false,data:{friendRequests:friendRequests} })));
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
      requestsSent = requests.requestsSent;
      requestsSent.splice(requestsSent.indexOf(userId), 1);
      await this._update.db(new Query(table.requests+'/'+loggedInUserId,new Options({ loading:false,data:{requestsSent:requestsSent} })));
      var friendRequests;
      requests = await this.getRequests(userId);
      friendRequests = requests.friendRequests;
      friendRequests.splice(friendRequests.indexOf(loggedInUserId), 1);
      await this._update.db(new Query(table.requests+'/'+userId,new Options({ loading:false,data:{friendRequests:friendRequests} })));
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
      friendRequests = requests.friendRequests;
      friendRequests.splice(friendRequests.indexOf(userId), 1);
      await this._update.db(new Query(table.requests+'/'+loggedInUserId,new Options({data:{ friendRequests: friendRequests } })));
      let requestsSent = requests.requestsSent;
      requestsSent.splice(requestsSent.indexOf(loggedInUserId), 1);
      await this._update.db(new Query(table.requests+'/'+userId,new Options({data:{ requestsSent: requestsSent } })));
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
    
    let account = await this.getUser(loggedInUserId);
    var friends = account.friends;
    if (!friends) {
      friends = [userId];
    } else {
      friends.push(userId);
    }

    // DO AT HERE
    
    /*this._site.getUser().then(user=>{
      let loggedInUserId = user.id;
      this.deleteFriendRequest(userId);

      this.loadingShow();
      this.getUser(loggedInUserId).then(accountFriendSup=>{
        accountFriendSup.take(1).subscribe(account=>{
            var friends = account.friends;
            if (!friends) {
              friends = [userId];
            } else {
              friends.push(userId);
            }
            // Add both users as friends.
            this.getUser(loggedInUserId).then(friendsSup=>{
              friendsSup.update({
               friends: friends
              }).then((success) => {
                this.getUser(userId).then(accountSup=>{
                  accountSup.take(1).subscribe(account=>{
                    var friends = account.friends;
                    if (!friends) {
                      friends = [loggedInUserId];
                    } else {
                      friends.push(loggedInUserId);
                    }
                    this.getUser(userId).then(userSup=>{
                      userSup.update({
                      friends: friends
                      }).then((success) => {
                        this.loadingHide();
                      }).catch((error) => {
                        this.loadingHide();
                      });
                    })
                  });
                });
              }).catch((error) => {
                this.loadingHide();
              });
            });
        });
      });

    });*/
    // Delete friend request.
    
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

  //createUser
  /*createUserData(){
    return new Promise<any>((resolve,reject)=>{
      this._site.getUser().then(user=>{
        this._site.getSite().then(site=>{
          firebase.database().ref(site+'/chat_accounts/' + user.id).once('value')
            .then((account) => {
              if (!account.val()) {
                this.loadingShow();
                
                var userId, username, img, email;
                userId = user.id;
                if(user.image){
                  img = user.image;
                }else{
                  img = "assets/img/theme/chat/theme1/profile.png";
                }
                email = user.email;
                username = user.username;
                let description = "I'm Available for chat";
                this.angularfire.object(site+'/chat_accounts/' + user.id).set({
                  userId: userId,
                  name: username,
                  username: username,
                  img: img,
                  email: email,
                  description: description,
                  dateCreated: new Date().toString()
                }).then(() => {
                  this.loadingHide();
                  resolve(1);
                });
                this.loadingHide();
                resolve(1);
              }else{
                resolve(1);
              }
            });
          });
        })
    }); 
  }

  // Get user with username
  getUserWithUsername(username) {
    return new Promise<FirebaseListObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(this.angularfire.list(site+'/chat_accounts', {
          query: {
            orderByChild: 'username',
            equalTo: username
          }
        }));
      });
    });
  }

  // Get logged in user data
  getCurrentUser() {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
          resolve(this.angularfire.object(site+'/chat_accounts/' + user.id));
        });
      });
    });
  }

  // Get user by their userId
  getUser(userId="") {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
          if(!userId){
            userId = user.id;
          }
          resolve(this.angularfire.object(site+'/chat_accounts/' + userId));
        });
      });
    });
  }

  // Get requests given the userId.
  getRequests(userId="") {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
          if(!userId){
            userId = user.id;
          }
          resolve(this.angularfire.object(site+'/chat_requests/' + userId));
        });
      });
    });
  }

  // Get friend requests given the userId.
  getFriendRequests(userId) {
    return new Promise<FirebaseListObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(this.angularfire.list(site+'/chat_requests', {
          query: {
            orderByChild: 'receiver',
            equalTo: userId
          }
        }));
      });
    });
  }

  getAccountsConversationUser(userId){
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
           resolve(this.angularfire.object(site+'/chat_accounts/' + user.id + '/conversations/'+userId));
        });
      });
    });
  }
  getAccountsConversationUserSender(userId){
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
           resolve(this.angularfire.object(site+'/chat_accounts/' + userId + '/conversations/'+user.id));
        });
      });
    });
  }

  // Get conversation given the conversationId.
  getConversation(conversationId) {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(this.angularfire.object(site+'/chat_conversations/' + conversationId));
      });
    });
  }

  // Get conversations of the current logged in user.
  getConversations() {
    return new Promise<FirebaseListObservable<any>>((resolve,reject)=>{
        this._site.getSite().then(site=>{
          this._site.getUser().then(user=>{
            resolve(this.angularfire.list(site+'/chat_accounts/'+user.id+'/conversations'));
          })
        });
    });
  }

  getConversationsAll() {
    return new Promise<FirebaseListObservable<any>>((resolve,reject)=>{
        this._site.getSite().then(site=>{
          this._site.getUser().then(user=>{
            resolve(this.angularfire.list(site+'/chat_conversations'));
          })
        });
    });
  }


  // Get messages of the conversation given the Id.
  getConversationMessages(conversationId) {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(this.angularfire.object(site+'/chat_conversations/' + conversationId + '/messages'));
      });
    });
  }

  // Get messages of the group given the Id.
  getGroupMessages(groupId) {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        resolve(this.angularfire.object(site+'/chat_groups/' + groupId + '/messages'));
      });
    });
  }

  // Get groups of the logged in user.
  getGroups() {
    return new Promise<FirebaseListObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
        this._site.getUser().then(user=>{
          resolve(this.angularfire.list(site+'/chat_accounts/'+user.id+'/groups'));
        });
      });
    });
  }

  // Get group info given the groupId.
  getGroup(groupId) {
    return new Promise<FirebaseObjectObservable<any>>((resolve,reject)=>{
      this._site.getSite().then(site=>{
       resolve(this.angularfire.object(site+'/chat_groups/' + groupId));
      });
    });
  }

   // Send friend request to userId.
  sendFriendRequest(userId) {
    this._site.getUser().then(user=>{
      this._site.getSite().then(site=>{
        let loggedInUserId = user.id;
        this.loadingShow();

        var requestsSent;
        // Use take(1) so that subscription will only trigger once.
        this.getRequests(loggedInUserId).then(requestsSup=>{
          requestsSup.take(1).subscribe(requests=>{
            requestsSent = requests.requestsSent;
            if (!requestsSent) {
              requestsSent = [userId];
            } else {
              if(requestsSent.indexOf(userId) == -1)
                requestsSent.push(userId);
            }
            // Add requestsSent information.
            this.angularfire.object(site+'/chat_requests/' + loggedInUserId).update({
              requestsSent: requestsSent
            }).then((success) => {
              var friendRequests;
              this.getRequests(userId).then(friendRequestsSup=>{
                friendRequestsSup.take(1).subscribe(requests=>{
                    friendRequests = requests.friendRequests;
                    if (!friendRequests) {
                      friendRequests = [loggedInUserId];
                    } else {
                      if(friendRequests.indexOf(userId) == -1)
                        friendRequests.push(loggedInUserId);
                    }
                    // Add friendRequest information.
                    this.angularfire.object(site+'/chat_requests/' + userId).update({
                      friendRequests: friendRequests
                    }).then((success) => {
                      this.loadingHide();
                      this._alert.showFriendRequestSent();
                    }).catch((error) => {
                      this.loadingHide();
                    });
                });
              });
            }).catch((error) => {
              this.loadingHide();
            });
          });
        });
      });
    });
  }

  // Cancel friend request sent to userId.
  cancelFriendRequest(userId) {
    this._site.getUser().then(user=>{
      this._site.getSite().then(site=>{
        let loggedInUserId = user.id;
        this.loadingShow();
          var requestsSent;
          this.getRequests(loggedInUserId).then(requestsSentSup=>{
            requestsSentSup.take(1).subscribe(requests=>{
              requestsSent = requests.requestsSent;
              requestsSent.splice(requestsSent.indexOf(userId), 1);
              // Update requestSent information.
              this.angularfire.object(site+'/chat_requests/' + loggedInUserId).update({
                requestsSent: requestsSent
              }).then((success) => {
                var friendRequests;
                this.getRequests(userId).then(requestsSup=>{
                  requestsSup.take(1).subscribe(requests=>{
                    friendRequests = requests.friendRequests;
                    friendRequests.splice(friendRequests.indexOf(loggedInUserId), 1);
                    // Update friendRequests information.
                    this.angularfire.object(site+'/chat_requests/' + userId).update({
                      friendRequests: friendRequests
                    }).then((success) => {
                      this.loadingHide();
                      this._alert.showFriendRequestRemoved();
                    }).catch((error) => {
                      this.loadingHide();
                    });
                  });
                });
              }).catch((error) => {
                this.loadingHide();
              });
            });
          });
      });
    });
    
  }

  // Delete friend request.
  deleteFriendRequest(userId) {
    this._site.getUser().then(user=>{
      this._site.getSite().then(site=>{
        let loggedInUserId = user.id;
        this.loadingShow();

        var friendRequests;
        this.getRequests(loggedInUserId).then(requestsSup=>{
          requestsSup.take(1).subscribe(requests=>{
             friendRequests = requests.friendRequests;
              friendRequests.splice(friendRequests.indexOf(userId), 1);
              // Update friendRequests information.
              this.angularfire.object(site+'/chat_requests/' + loggedInUserId).update({
                friendRequests: friendRequests
              }).then((success) => {
                var requestsSent;
                this.getRequests(userId).then(requestsSentSup=>{
                  requestsSentSup.take(1).subscribe(requests=>{
                     requestsSent = requests.requestsSent;
                     requestsSent.splice(requestsSent.indexOf(loggedInUserId), 1);
                     this.angularfire.object(site+'/chat_requests/' + userId).update({
                        requestsSent: requestsSent
                      }).then((success) => {
                        this.loadingHide();

                      }).catch((error) => {
                        this.loadingHide();
                      });
                  });
                })
              }).catch((error) => {
                this.loadingHide();
                //TODO ERROR
              });
          });
        })
      });
    });
  }

  // Accept friend request.
  acceptFriendRequest(userId) {
    this._site.getUser().then(user=>{
      let loggedInUserId = user.id;
      this.deleteFriendRequest(userId);

      this.loadingShow();
      this.getUser(loggedInUserId).then(accountFriendSup=>{
        accountFriendSup.take(1).subscribe(account=>{
            var friends = account.friends;
            if (!friends) {
              friends = [userId];
            } else {
              friends.push(userId);
            }
            // Add both users as friends.
            this.getUser(loggedInUserId).then(friendsSup=>{
              friendsSup.update({
               friends: friends
              }).then((success) => {
                this.getUser(userId).then(accountSup=>{
                  accountSup.take(1).subscribe(account=>{
                    var friends = account.friends;
                    if (!friends) {
                      friends = [loggedInUserId];
                    } else {
                      friends.push(loggedInUserId);
                    }
                    this.getUser(userId).then(userSup=>{
                      userSup.update({
                      friends: friends
                      }).then((success) => {
                        this.loadingHide();
                      }).catch((error) => {
                        this.loadingHide();
                      });
                    })
                  });
                });
              }).catch((error) => {
                this.loadingHide();
              });
            });
        });
      });

    });
    // Delete friend request.
    
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
  }*/

}


