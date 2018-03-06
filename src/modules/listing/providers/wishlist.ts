import { Injectable } from '@angular/core';
import { StorageService } from 'ng-prov';
import { Events } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as _ from 'lodash';


@Injectable()
export class ListingWishlistService{
  titleWishlist = "listing_wishlist";
  constructor(public _storage:StorageService,public event:Events){}
  
  checkWishlist(id){
    return this.getCacheWishlist().then(wishlist=>{
      let callback = false;
      _.forEach(wishlist,function(value,key){
        if(value.id == id){
          callback = true;
        }
      });
      return callback;
    });
  }
  intoWishlist(item){
    return new Promise((resolve, reject) => {
      let product = item;
      let wishlistArray = [];
      this.getCacheWishlist().then(wishlist=>{
            if(wishlist != null){
              wishlistArray = wishlist;
            }
            this.checkRepeatWishlist(product.id).then(key=>{
              if(key == null){
                  wishlistArray.push(product);
                  this._storage.setLocal(this.titleWishlist,wishlistArray).then(callback=>{
                    this.event.publish('listing_wishlistLength',wishlistArray.length);
                    resolve(1);
                  });
              }

            });
       });
    });    
  }

  checkRepeatWishlist(id){
    return this.getCacheWishlist().then(wishlist=>{
       let callback;
       _.forEach(wishlist,function(value,key){
           if(value.id == id){
             callback = key;
           }
      });
       return callback;
     });
  }

  getCacheWishlist(){
    return this._storage.getLocal(this.titleWishlist).then(wishlist=>{
      return wishlist;
    });
  }
  
  getWishlistLength(){
    return this.getCacheWishlist().then((item)=>{ 
        let size = _.size(item);
        if(size != 0){
          return size;
        }
        return null;
    });
  }

  async deleteWishlistById(id){
    let cache =  await this.getCacheWishlist();
    if(cache){
      let wishlist = [];
      wishlist = cache;
      wishlist = wishlist.filter(data=>data.id !== id);
      await this._storage.setLocal(this.titleWishlist,wishlist);
      if(wishlist.length > 0){
          this.event.publish('listing_wishlistLength',wishlist.length);
      }else{
          this.event.publish('listing_wishlistLength','empty');
      }
      return (wishlist);
    }
    return 0;
  }

  deleteWishlist(index){
    return new Promise((resolve, reject) => {
      let wishlist = [];
      this.getCacheWishlist().then(cache=>{
        if(cache){
          wishlist = cache;
          wishlist.splice(index,1);
          this._storage.setLocal(this.titleWishlist,wishlist).then(callback=>{
            if(wishlist.length > 0){
              this.event.publish('listing_wishlistLength',wishlist.length);
            }else{
              this.event.publish('listing_wishlistLength','empty');
            }
            resolve(wishlist);
          });
        }else{
          resolve(0);
        }
      });
    });
  }
}


