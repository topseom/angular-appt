import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { SiteService,StorageService,AuthService } from 'ng-prov';
import { EcomCouponService} from './coupon';

import { Events } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
//import * as _ from 'lodash';

export interface ProductCart{
  product:any;
  options:Array<any>;
  qty:number
}

export class Order{
  cart = [];
  total = 0;
  user:any;
  address:any;
  shipping:any;
  coupon:any;
}

@Injectable()
export class EcomCartService{
  titleOrder = "orderEcom"
  titleCart = "ecom_cart";
  titleTotal = "total";
  eventCartLength = "cartLength";

  textToastAddProduct = "add product into cart!";
  textToastRemoveProduct = "remove product in cart success!";

  ToastTimeOut = 300;
  constructor(public _storage:StorageService,public _auth:AuthService,public event:Events,public toastCtrl:ToastController,public _site:SiteService,public _coupon:EcomCouponService){}

  // Cart 
  selectProductOption(options:Array<any>,select,index){
    return new Promise<any>((resolve,reject)=>{
      if(options.length ==0){
          options[index]=select;
      }else{
          let filter = options.filter(function(e){ return e.id == select.id});
          if(filter.length > 0){
            options.forEach((data,index)=>{
              if(data.id == select.id){
                if(options[index] == select){
                  //console.log(options);
                  delete options[index];
                  //console.log(options);
                }else{
                  options[index] = select;
                }
              }
            });
          }else{
            options[index]=select;
          }
      }
      resolve(options);
    });
  }
  getOrder(){
    return new Promise<Order>((resolve,reject)=>{
      this._storage.getLocal(this.titleOrder).then(order=>{
        if(order){
          resolve(order);
        }else{
          let init = new Order();
          this.setOrder(init).then(callback=>{
            resolve(init);
          });
        }
      })
    });
  }
  setOrder(order:Order){
    return new Promise<any>((resolve,reject)=>{
      this._storage.setLocal(this.titleOrder,order).then(finish=>{
        resolve(order);
      });
    });
  }
  removeOrder(){
    return new Promise<any>((resolve, reject) => {
       this._storage.removeLocal(this.titleOrder).then(cart=>{
           this.event.publish(this.eventCartLength,'empty');
           resolve(1);
       });
    });
  }
  productTotalCalculate(order:Order){
      return new Promise<any>((resolve,reject)=>{
        order.total = 0;
        order.cart.forEach(data=>{
          order.total = (data.qty*parseInt(data.product.price)) + order.total;
        });

        resolve(order);
      });
  }
  updateProductCartItem(order:Order){
    return new Promise<any>((resolve,reject)=>{
      this.productTotalCalculate(order).then(final=>{
            this.setOrder(final).then(finish=>{
              resolve(final);
            });
      });
    });
  }
  addProductCart(item:ProductCart){
    let checkProductRepeat = (item,cart)=>{
      return new Promise<any>((resolve,reject)=>{
        if(item.options){
          item['optionCompress'] = "";
          item.options.forEach(op=>{
            item['optionCompress'] = item['optionCompress']+op.id+op.variations.id;
          });
          let check = false;
          if(cart.length){
            cart.forEach(data=>{
              if(data.optionCompress == item['optionCompress']){
                data.qty = data.qty + item.qty;
                check = true;
              }
            })
          }
          if(check){
            resolve({error:-2,cart:cart});
          }
          resolve(item);
        }else{
          resolve(item);
        }
      });
    };
    return new Promise<any>((resolve,reject)=>{
      this.getOrder().then(order=>{
        checkProductRepeat(item,order.cart).then(itemChecked=>{
            if(itemChecked.error != -2){
              order.cart.push(itemChecked);
            }else{
              order.cart = itemChecked.cart;
            }
            this.updateProductCartItem(order).then(final=>{
              let numberCart = 0;
              order.cart.forEach(data=>{
                numberCart += data.qty;
              });
              this.event.publish(this.eventCartLength,numberCart);
              let toast = this.toastCtrl.create({
                message:this.textToastAddProduct,
                duration:this.ToastTimeOut,
                position:"top"
              })
              toast.present();
              resolve(1);
            });
        });
      });
    });
  }
  deleteProductCart(index:number){
    return new Promise<any>((resolve,reject)=>{
      this.getOrder().then(order=>{
        if(order){
          order.cart.splice(index, 1);
          this.updateProductCartItem(order).then(final=>{
              if(order.cart.length){
                  let numberCart = 0;
                  order.cart.forEach(data=>{
                    numberCart += data.qty;
                  });
                  this.event.publish(this.eventCartLength,numberCart);
              }else{
                  this.event.publish(this.eventCartLength,'empty');
              }
              let toast = this.toastCtrl.create({
                message:this.textToastRemoveProduct,
                duration:this.ToastTimeOut,
                position:"top"
              })
              toast.present();
              resolve(final);
          });
        }else{
          resolve(0);
        }
      });
    });
  }
  getCartLength(){
    return new Promise<any>((resolve,reject)=>{
      this.getOrder().then(order=>{
        resolve(order.cart.length);
      });
    });
  }

  //Coupon
  couponActive(coupon:any,cart:Array<any>,total:number){
    return new Promise((resolve,reject)=>{
      this._coupon.couponActive(coupon,cart,total).then(callback=>{
        if(callback){
          this.getOrder().then(order=>{
            if(callback == 'remove'){
              order.coupon = null;
            }else{
              order.coupon = callback;
            }
            this.setOrder(order).then(finish=>{
              resolve(callback);
            });
          });
        }else{
          resolve(0);
        }
      });
    });
  }
  couponRemove(){
    return new Promise((resolve,reject)=>{
      this.getOrder().then(order=>{
        if(order){
          order.coupon = null;
          this.setOrder(order).then(finish=>{
              resolve(1);
          });
        }else{
          resolve(0);
        }
      });
    });
  }

  //Address
  setAdress(address:any){
    return new Promise<any>((resolve,reject)=>{
      this.getOrder().then(order=>{
        this._auth.getUser().then(user=>{
          if(order){
            order.user = user;
            order.address = address;
            this.setOrder(order).then(finish=>{
              resolve(1);
            });
          }else{
            resolve(0);
          }
        });
      });
    });
  }

  //Shipping
  setShipping(shipping:any){
    return new Promise<any>((resolve,reject)=>{
      this.getOrder().then(order=>{
        if(order){
          order.shipping = shipping;
          this.setOrder(order).then(finish=>{
            resolve(1);
          });
        }else{
          resolve(0);
        }
      });
    });
  }


}

