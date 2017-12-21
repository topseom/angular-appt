import { Injectable } from '@angular/core';
import { QueryService,SiteService,StorageService } from 'ng-prov';
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
//import * as _ from 'lodash';


@Injectable()
export class EcomCouponService{
  titleCoupon = "ecom_coupon";
  constructor(public _storage:StorageService,public toastCtrl:ToastController,public _site:SiteService,public event:Events,public loadCtrl:LoadingController,public _query:QueryService,public alertCtrl:AlertController){}
  
  couponActive(coupon,cartItems,total){
    return new Promise((resolve, reject) => {
      if(!coupon){
          this._site.getUser().then(user=>{
            if(user){
              let alert = this.alertCtrl.create({
              title: 'Coupon Active',
              inputs: [
                    {
                      name: 'title',
                      placeholder: 'title'
                    },
                  ],
              buttons: [
                    {
                      text: 'Get',
                      handler: data => {
                        if(data.title != "")
                        { 
                          this.couponCheckCondition(data.title,user,cartItems,total).then(callback=>{
                            if(callback){
                              let toast = this.toastCtrl.create({
                                message:"Coupon is Activeted!",
                                duration: 500,
                                position:"top"
                              })
                              toast.present();
                            }
                            resolve(callback);
                          })
                        }
                    
                      }
                    }
                  ]
               });
               alert.present();
            }else{
               let alert = this.alertCtrl.create({
                 message: 'Please Signin',
                 buttons:[{
                   text:"Ok",
                   handler : ()=>{
                     resolve(0);
                   }
                 }]
               })
               alert.present();
            }
          });
      }else{
        let alert = this.alertCtrl.create({
          title: 'Coupon Already Active',
          message:"Do your want to remove coupon?",
          buttons:[{
            text : "Remove",
            handler : ()=>{
              this.removeCoupon().then(callback=>{
                if(callback){
                              let toast = this.toastCtrl.create({
                                message:"Coupon is Remove!",
                                duration: 500,
                                position:"top"
                              })
                              toast.present();
                }
                resolve('remove');
              })
            }
          },{
            text : "Cancel",
            handler : ()=>{
              resolve(0);
            }
          }]
        });
        alert.present();
      }
      

    });
  }

  couponCheckCondition(title,user,cartItems,total){
    let loader = this.loadCtrl.create();
    loader.present();
    return new Promise((resolve, reject) => {
        console.log(title);
        this._query.product_coupon({title:title}).then(callback=>{
          if(callback){
              let promotion = callback;

              
                  
              this._query.product_couponUsed({id:promotion.id}).then(limit=>{
                  let limit_used = (limit as any).length;
                  let limit_use = parseInt(promotion.conditions.coupon_limit);
                  if(limit_used > limit_use){
                  //if(limit_used < limit_use){
                      this._query.product_couponTime({userId:user.id,id:promotion.id}).then(number=>{
                            number = (number as any).length;
                            // condition
                            let conditions = (promotion as any).conditions;
                            let price_con = conditions.price_con ||false;
                            let types_price = conditions.types_price ||false;
                            let product_sale = conditions.product_sale || false;
                            let user_groups = conditions.user_groups || false;
                            let once_per_cus = conditions.once_per_cus || false;
                            let product_id = conditions.product || false;
                            
                            let price_boolean;
                            let product_sale_boolean;
                            let user_boolean;
                            let once_per_cus_boolean;
                            let product_boolean;
                           
                            let operators = {
                              'more_than_equal': function(a, b) { return a >= b },
                              'more_than': function(a,b) { return a > b },
                              'less_than_equal' :function(a,b) { return a <= b},
                              'less_than': function(a,b) { return a < b },
                              'equal_to': function(a,b) { return a == b }
                            };
                            let check_price_boolean=false;
                            if(price_con && types_price){

                                price_boolean = false;
                                for(let i=0 ;i< (price_con as any).length ;i++){
                                  let price = parseInt(price_con[i]);

                                  if(operators[types_price[i]](total,price) && !check_price_boolean){
                                    price_boolean = true;
                                  }
                                  else if(!check_price_boolean){
                                    price_boolean = false;
                                    check_price_boolean = true;
                                  }
                                }

                             }
                             else{
                               price_boolean = true;
                             }

                              //Oncer Per Customer Condition
                              if(once_per_cus){

                                 if(once_per_cus == "yes" && number == 0){
                                   once_per_cus_boolean = true;
                                 }
                                 else if(once_per_cus == "yes" && number > 0){
                                   once_per_cus_boolean = false;
                                 }
                                 else if(once_per_cus == "no"){
                                   once_per_cus_boolean = true;
                                 }

                              }
                              else{
                                once_per_cus_boolean = true;
                              }

                              if(product_sale){
                                if(cartItems && product_sale=="no"){
                                  product_sale_boolean = false;
                                }
                                else if(cartItems && product_sale=="yes"){
                                  product_sale_boolean = true;
                                }
                              }
                              else{
                                product_sale_boolean = true;
                              }

                              //Product Condition
                              if(product_id){
                                product_boolean = false;
                              }
                              else{
                                product_boolean = true;
                              }

                              //User Groups Condition
                              if(user_groups){
                                user_groups.forEach(data=>{
                                  if(data == user.group_id){
                                    user_boolean = true;
                                  }
                                })
                              }
                              else{
                                user_boolean = true;
                              }
                              loader.dismiss().then(callback=>{
                                if(price_boolean && product_sale_boolean && user_boolean && once_per_cus_boolean && product_boolean){
                                  this._storage.setLocal(this.titleCoupon,promotion).then(callback=>{
                                    resolve(promotion);
                                  });
                                }else if(!once_per_cus_boolean){
                                    let alert = this.alertCtrl.create({
                                        title: 'Attendtion',
                                        subTitle: "You already, This Coupon Use Once Per Customer ",
                                        buttons: [{
                                            text: 'Ok',
                                            handler: () => {
                                              resolve(0);
                                            }
                                         }]
                                      });
                                 
                                    alert.present();
                                }
                                else if(!price_boolean){

                                      let alert = this.alertCtrl.create({
                                          title: 'Attendtion',
                                          subTitle: "You Condition Not Complete : Price ",
                                          buttons: [{
                                              text: 'Ok',
                                              handler: () => {
                                                resolve(0);
                                              }
                                           }]
                                        });
                                   
                                      alert.present();
                      
                                }
                                else if(!user_boolean){
                                  let alert = this.alertCtrl.create({
                                      title: 'Attendtion',
                                      subTitle: "You Condition Not Complete : User Group",
                                      buttons: [{
                                          text: 'Ok',
                                          handler: () => {
                                            resolve(0);
                                          }
                                       }]
                                    });
                               
                                  alert.present();
                                }
                                else if(!product_boolean && !product_sale_boolean){
                                  let alert = this.alertCtrl.create({
                                      title: 'Warning',
                                      subTitle: "This Bonuses Excluding some *ProductSale *Product",
                                      buttons: [{
                                          text: 'Ok',
                                          handler: () => {
                                            resolve(promotion);
                                          }
                                       }]
                                    });
                               
                                  alert.present();
                                }
                                else if(!product_boolean){
                                  let alert = this.alertCtrl.create({
                                      title: 'Warning',
                                      subTitle: "This Bonuses Excluding some product",
                                      buttons: [{
                                          text: 'Ok',
                                          handler: () => {
                                            resolve(promotion);
                                          }
                                       }]
                                    });
                               
                                  alert.present();
                                }
                                else if(!product_sale_boolean){
                                  let alert = this.alertCtrl.create({
                                      title: 'Warning',
                                      subTitle: "This Bonuses Excluding Product Sale (some product have a product sale)",
                                      buttons: [{
                                          text: 'Ok',
                                          handler: () => {
                                            resolve(promotion);
                                          }
                                       }]
                                    });
                               
                                  alert.present();
                                }
                              });
                              
                      })

                     

                   
                  }else{
                        loader.dismiss().then(callback=>{
                          let alert = this.alertCtrl.create({
                              message: "Coupon is limited time!",
                              buttons:[{
                                text:"Ok",
                                handler: () => {
                                  resolve(0);
                                }
                              }]
                          });
                          alert.present();
                        });
                      }
                  })
              

         }else{
                loader.dismiss().then(callback=>{
                  let alert = this.alertCtrl.create({
                    message: "Coupon is not available",
                    buttons:[{
                      text:"Ok",
                      handler: () => {
                        resolve(0);
                      }
                    }]
                  });
                  alert.present();
                })
                
         }
              
        });
     });
  }

  couponCalulate(coupon,cartItems,shipping,total_ori){
    return new Promise((resolve, reject) => {
      let freeshiping = false;
      let discount_ori = false;
      if(coupon){
        (coupon as any).bonuses.free_shipping.forEach(free=>{
            if(free == (shipping as any).id){
              freeshiping = true;
            }
        });
      }
      if(!freeshiping){
        total_ori = total_ori + parseInt((shipping as any).price);
      }
      if(coupon){
        let discount_types = coupon.bonuses.discount_types || false;
        let discount_value = coupon.bonuses.discount_vale || false;

        let product_id = coupon.conditions.product || false;
        let product_qty = coupon.conditions.quantity || false;
        let product_sale = coupon.conditions.product_sale || false;
        if(discount_types && product_id && product_sale == "yes" || !product_sale){
          console.log(" ==> PRODUCT ID AND PRODUCT SALE yes  <== ");
          let total = 0;
          (cartItems as any).forEach(item=>{
              let qty = item.qty;
              for(let j=0 ;j<product_id.length;j++){
                let product_qty_single = parseInt(product_qty[j]);
                if(qty < product_qty_single){
                  qty = product_qty_single - qty;
                }
                if(item.product.id == product_id[j]){

                  for(let i=0 ;i<discount_types.length;i++ ){
                      if(discount_types[i] == "by_percentage"){
                      
                        let discount = (item.price*(parseInt(discount_value[i])/100))
                        let price_discount = (item.price * qty) - (discount * qty);
                        total = total + price_discount;
                       

                      }
                      else{

                        let discount = parseInt(discount_value[i]);
                        let price_discount = (item.price * qty) - (discount * qty);
                        total = total + price_discount;
                       
                      }
                    }

                  }
                  else{
                        total = total + item.product.price;
                  }
            }
          });
          if(total > 0){
            total_ori = total;
            discount_ori = true;
          }
          resolve({total:total_ori,discount:discount_ori,freeshiping:freeshiping});



        }else if(discount_types && product_sale == "yes" || !product_sale){
          console.log(" ==> PRODUCT SALE yes  <== ");
          let total = 0;
          cartItems.forEach(item=>{
            let qty = item.qty;
            for(let i=0 ;i<discount_types.length;i++ ){
              if(discount_types[i] == "by_percentage"){
              
                let discount = (item.product.price*(parseInt(discount_value[i])/100))
                let price_discount = (item.product.price * qty) - (discount * qty);
                total = total + price_discount;
                //this.total = this.total - discount;

              }
              else{

                let discount = parseInt(discount_value[i]);
                let price_discount = (item.product.price * qty) - (discount * qty);
                total = total + price_discount;
                //this.total = this.total - discount;
              }
            }
            
          });
          total_ori = total;
          discount_ori = true;
          resolve({total:total_ori,discount:discount_ori,freeshiping:freeshiping});

        }else if(discount_types && product_id){
          console.log(" ==> PRODUCT ID AND PRODUCT SALE no <== ");
          let total = 0;
          let check_total =0;
          cartItems.forEach(item=>{
            let qty = item.qty;
            if(item.product.sale && item.product.sale.value == "yes"){

              total = total + item.product.price;

            }
            else{
              
              for(let j=0 ;j<product_id.length;j++){
                  let product_qty_single = parseInt(product_qty[j]);
                  if(qty < product_qty_single){
                      qty = product_qty_single - qty;
                  }
                  if(item.product.id == product_id[j]){

                    for(let i=0 ;i<discount_types.length;i++ ){
                      if(discount_types[i] == "by_percentage"){
                      
                        let discount = (item.product.price*(parseInt(discount_value[i])/100))
                        let price_discount = (item.product.price * qty) - (discount * qty);
                        total = total + price_discount;
                        check_total = total;

                      }
                      else{

                        let discount = parseInt(discount_value[i]);
                        let price_discount = (item.product.price * qty) - (discount * qty);
                        total = total + price_discount;
                        check_total = total;
                      }
                    }

                  }
                  else{
                    total = total + item.product.price;
                  }
              
              }

            }
            
          });
          
          if(check_total > 0){
            total_ori = total;
            discount_ori = true;
          }
          resolve({total:total_ori,discount:discount_ori,freeshiping:freeshiping});



        }else if(discount_types && discount_value){
          console.log(" ==> PRODUCT SALE no  <== ");
          let total = 0;

          cartItems.forEach(item=>{
            let qty = item.qty;
            if(item.product.sale && item.product.sale.value == "yes"){

              total = total + item.product.price;

            }
            else{
              for(let i=0 ;i<discount_types.length;i++ ){

                if(discount_types[i] == "by_percentage"){

                  let discount = (item.product.price*(parseInt(discount_value[i])/100));
                  let price_discount = (item.product.price * qty) - (discount * qty);
                  //console.log("discount",discount);
                  //console.log("price_discount",price_discount);
                  total = total + price_discount;
                }
                else{
                  let discount = parseInt(discount_value[i]);
                  let price_discount = (item.product.price * qty) - (discount * qty);
                  total = total + price_discount;
                }

              }
              
            }
            
          })
          total_ori = total;
          discount_ori = true;
          resolve({total:total_ori,discount:discount_ori,freeshiping:freeshiping});

        }

      }else{
        resolve({total:total_ori,discount:discount_ori,freeshiping:freeshiping});
      }

    });

  
  }

  getCoupon(){
    return this._storage.getLocal(this.titleCoupon).then(coupon=>{
      return coupon;
    });
  }

  removeCoupon(){
    return new Promise((resolve, reject) => {
      this._storage.removeLocal(this.titleCoupon).then(callback=>{
        resolve(1);
      });
    });
  }


}

