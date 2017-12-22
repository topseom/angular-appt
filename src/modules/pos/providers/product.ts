import { Injectable } from '@angular/core';
import { AlertController,LoadingController,ToastController,Events } from 'ionic-angular';
import { DataService,QueryService,StorageService,AuthService,table } from 'ng-prov';
import * as tsmoment from 'moment';
const moment = tsmoment;
import 'rxjs/add/operator/map';

import { PosRedux } from './redux';

export class PaymentMethod{
  method:string;
  input = 0;
  change = 0;
  balance:number;
  result = 0;
  constructor(method:string,total:number){
    this.method = method;
    this.balance = total;
    this.result = total;
  }
}

export interface ProductCart{
  product:any;
  options:Array<any>;
  qty:number
}

export class OrderList{
  select:number;
  array = [];
}

export class OrderListArray{
  no:number;
  time = moment().format('LT');
  selectItem = 0;
  cart = [];
  pageView = {page_view:"product",component:"product"};
  customer = {
    username:"guest"
  };
  saler:any;
  editCart = {
    mode:"qty",
    redo:[]
  };
  total = 0;
  store:any;
  payment = {
    method:[],
    balance:null,
    change:0,
    select:0,
    validate:false
  }
  constructor(no:number,saler:any,store:any){
    this.store = store;
    this.no = no;
    this.saler = saler;
  }
}

@Injectable()
export class PosProductService{
  
  dataSet = [
      {data:table.product_list},
      {data:table.product_category},
      {data:table.product_barcode},
      {data:table.product_single},
      {data:table.order_single},
      {data:table.users_single}
  ];
  
  

  storeLocal = "dataSet";
  storeOrderList = "orderList";
  storeOrderSelect = "orderSelect";
  storeProductCart = "productCart";

  titleStore = "select_store";
  textAlertStoreClose = "Today Store is close!";
  textToastRemoveProduct = "remove product in cart success!";
  textToastAddProduct = "add product into cart!";

  ToastTimeOut = 300;
  constructor(public redux:PosRedux,public _data:DataService,public _storage:StorageService,public _auth:AuthService,public loadingCtrl:LoadingController,public toastCtrl:ToastController,public _query:QueryService,public alertCtrl:AlertController,public events:Events){}
  
  //LoadDataSet
  loadData(force=false){
    return new Promise<any>((resolve,reject)=>{
      this._storage.loadData(this.dataSet,force).then(callback=>{
        resolve(callback);
      });
    });
  }
  
  productStore(){
    return new Promise<any>((resolve,reject)=>{
      this._data.product_listAll({}).then(items=>{
        this.getStore().then(store=>{
          if(store){
            let store_id = store.id || false;
            if(store.product_all && store.product_all.value != 'Yes')
            {
                let filter = [];
                items.forEach(data=>{
                  if(data.store_array != 0 && data.store_array != undefined)
                  {
                      data.store_array.forEach(data2=>{
                        if(store_id == data2)
                        {
                          filter.push(data);
                        }
                      }); 
                  }
                });
            }
          }
          this.redux.changeProducts({ product_list: items,temp: items});
          resolve(items);
        });
      });
    });
  }
  


  //Page View
  changeProductPageView(pageView:string){
    return new Promise((resolve,reject)=>{
      if(pageView){
          this.getOrderSelected().then(order=>{
            if(order){
              let page = {page_view:"product",component:(pageView as any)};
              order.pageView = page;
              this.setOrderSelected(order).then(finish=>{
                this.redux.changePage(page);
                resolve(1);
              });
            }else{
              resolve(0);
            }
          });
      }else{
        resolve(0);
      }
    });
  }
  getProductPageViewCurrent(){
    return new Promise((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
          if(order){
            this.changeProductPageViewInner(order.pageView);
            resolve(0);
          }else{
            resolve(1);
          }
      });
    });
  }
  changeProductPageViewInner(pageView:any){
    this.redux.changePage(pageView);
  }




  // Load Store
  loadStore(){
    return new Promise((resolve,reject)=>{
      this._query.product_store({load:true}).then(store=>{
        if(store){
          store.forEach(data=>{
            if(data.store_date){
              data.open_status = false;
              data.store_date.forEach(day =>{
                if(day == moment().format('ddd').toLowerCase())
                {
                  data.open_status = true;
                }
              });
            }else{
               data.open_status = true;
            }
          });
          resolve(store);
        }else{
          resolve(0);
        }
      });
    });
  }
  setStore(store:any){
  	return new Promise((resolve,reject)=>{
  		if(store.open_status){
  			this._storage.setLocal(this.titleStore,store).then(callback=>{
  				resolve(1);
  			});
  		}else{
  			resolve(0);
  			let alert = this.alertCtrl.create({
				title: 'Attention',
				subTitle: this.textAlertStoreClose,
				buttons: [{
					 text: 'Ok',
					 handler: () => {
					 }
				  }]
				});
			alert.present();
  		}
  	});
  }
  getStore(){
  	return new Promise<any>((resolve,reject)=>{
  		this._storage.getLocal(this.titleStore).then(store=>{
  			resolve(store);
  		});
  	});
  }


  orderListInit(){
    return new Promise<any>((resolve,reject)=>{
      this._auth.getUser().then(user=>{
          this.getStore().then(store=>{
            user = user || false;
            let orderNew = new OrderListArray(1,user,store);
            let order = new OrderList();
            order.select = 0;
            order.array.push(orderNew);
            this.setOrderList(order).then(callback=>{
              this.changeProductPageViewInner(orderNew.pageView);
              resolve(order);
            });
        });
      });
    });
  }
  orderListAdd(){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderList().then(order=>{
        if(order){
          let no = (order.array[order.array.length-1].no)+1;
          this._auth.getUser().then(user=>{
            this.getStore().then(store=>{
              user = user || false;
              let orderNew = new OrderListArray(no,user,store);
              order.select = order.array.length;
              order.array.push(orderNew);
              this.setOrderList(order).then(callback=>{
                 this.changeProductPageViewInner(order.array[order.select].pageView);
                 resolve(order);
              });
            });
          });
        }else{
          this.orderListInit().then(callback=>{
            resolve(callback);
          });
        }
      });
    });
  }
  
  orderListSelect(index:number){
     return new Promise<any>((resolve,reject)=>{
        this.getOrderList().then(order=>{
           if(order){
             order.select = index;
             this.setOrderList(order).then(callback=>{
              this.changeProductPageViewInner(order.array[order.select].pageView);
               resolve(order);
             });
           }else{ 
             resolve(0);
           }
        });
     });
  }
  orderListRemove(){
     return new Promise<any>((resolve,reject)=>{
        this.getOrderList().then(order=>{
           if(order){
             let noRemove = order.select;
             order.array.splice(noRemove, 1);
             if(order.array.length == 0){
               this.orderListInit().then(callback=>{
                 resolve(callback);
               });
             }else{
               if((noRemove-1) < 0){
                 order.select = noRemove; 
               }else{
                 order.select = noRemove-1; 
               }
               this.setOrderList(order).then(callback=>{
                this.changeProductPageViewInner(order.array[order.select].pageView);
                 resolve(order);
               });
             }
           }else{ 
             resolve(0);
           }
        });
     });
  }
  setOrderList(order:OrderList,updateOrder=true){
    return new Promise<any>((resolve,reject)=>{
      this.getStore().then(store=>{
        store = store.id || "none";
        this._storage.setLocal(this.storeOrderList+'_'+store,order).then(callback=>{
          if(updateOrder){
            this.redux.changeOrders(order);
          }
          resolve(1);
        });
      });
    });
  }
  getOrderList(){
    return new Promise<any>((resolve,reject)=>{
      this.getStore().then(store=>{
        store = store.id || "none";
        this._storage.getLocal(this.storeOrderList+'_'+store).then(callback=>{
          if(callback){
            resolve(callback);
          }else{
            this.orderListInit().then(order=>{
              resolve(order);
            })
          }
        });
      });
    });
  }
  getOrderSelected(){
    return new Promise<OrderListArray>((resolve,reject)=>{
       this.getOrderList().then(callback=>{
         if(callback){
           resolve(callback.array[callback.select]);
         }else{
           resolve(null);
         }
       })
    });
  }
  setOrderSelected(order:OrderListArray){
    //console.log("aabbcc");
    return new Promise<OrderListArray>((resolve,reject)=>{
      this.getOrderList().then(callback=>{
        if(callback){
           callback.array[callback.select] = order;
           this.setOrderList(callback).then(finish=>{
             resolve(callback.array[callback.select]);
           });
         }else{
           resolve(null);
         }
      })
    });
  }

  //Customer
  setOrderCustomer(customer:any){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          console.log("Order",order);
          order.customer = customer;
          this.setOrderSelected(order).then(callback=>{
            resolve(1);
          });
        }else{
          resolve(0);
        }
        //order.customer 
        //console.log("ORDER",order);
      });
    });
  }


  //Cart
  selectProductOption(options:Array<any>,select){
    return new Promise<any>((resolve,reject)=>{
      if(options.length ==0){
          options.push(select);
      }else{
          let filter = options.filter(function(e){ return e.id == select.id});
          if(filter.length > 0){
            options.forEach((data,index)=>{
              if(data.id == select.id){
                options[index] = select;
              }
            });
          }else{
            options.push(select);
          }
      }
      resolve(options);
    });
  }
  productTotalCalculate(order:OrderListArray){
      return new Promise<any>((resolve,reject)=>{
        order.total = 0;
        order.cart.forEach(data=>{
          order.total = (data.qty*parseInt(data.product.price)) + order.total;
        });

        resolve(order);
      });
  }
  updateProductCartItem(order:OrderListArray){
    return new Promise<any>((resolve,reject)=>{
      this.productTotalCalculate(order).then(final=>{
            this.setOrderSelected(final).then(finish=>{
              resolve(final);
            });
      });
    });
  }
  createRedo(order:OrderListArray){
      return new Promise<any>((resolve,reject)=>{
        order.editCart.redo = JSON.parse(JSON.stringify(order.cart));
        resolve(order);
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
      this.getOrderSelected().then(order=>{
        checkProductRepeat(item,order.cart).then(itemChecked=>{
            if(itemChecked.error != -2){
              order.cart.push(itemChecked);
            }else{
              order.cart = itemChecked.cart;
            }
            order.editCart.mode = "qty";
            order.selectItem = order.cart.length - 1;
            this.createRedo(order).then(orderRedoCreated=>{
              this.updateProductCartItem(orderRedoCreated).then(final=>{
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
    });
  }
  getProductCart(){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        resolve(order.cart);
      });
    });
  }
  deleteProductCart(index:number){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          if((order.selectItem-1) >= 0){
            order.selectItem = order.selectItem-1;
          }
          order.cart.splice(index, 1);
          this.createRedo(order).then(orderRedoCreated=>{
            this.updateProductCartItem(orderRedoCreated).then(final=>{
              let toast = this.toastCtrl.create({
                message:this.textToastRemoveProduct,
                duration:this.ToastTimeOut,
                position:"top"
              })
              toast.present();
              resolve(final);
            });
          });
        }else{
          resolve(0);
        }
      });
    });
  }
  selectProductCartItem(index:number){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          order.selectItem = index;
          this.setOrderSelected(order).then(finish=>{
             resolve(index);
          });
        }else{
          resolve(0);
        }
      });
    });
  }
  
  changeProductSort(sort:string){
		if(sort){
			let toast = this.toastCtrl.create({
				message : "Sort "+sort+" Complete !",
				duration : 300,
				position : "top"
      });
      this.redux.changeProducts({sort:sort});
      toast.present();
      
		}
	}
 


  //Key Pad Product
  selectProductModeEdit(mode:string){
    return new Promise<any>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          order.editCart.mode = mode;
          this.setOrderSelected(order).then(finish=>{
            resolve(mode);
          });
        }else{
          resolve(0);
        }
      });
    });
  }
  inputProductEdit(input:number){
    
    let redoInput = () =>{
      let redoQty = (order)=>{
        return new Promise((resolve,reject)=>{
            order.cart[order.selectItem].checkQty = false;
            order.cart[order.selectItem].qty = order.editCart.redo[order.selectItem].qty;
            this.updateProductCartItem(order).then(final=>{
               resolve(final);
            });
        });
      };
      let redoDisc = (order)=>{
        return new Promise((resolve,reject)=>{
            order.cart[order.selectItem].product.discount = false;
            order.cart[order.selectItem].product.price = order.editCart.redo[order.selectItem].product.price;
            this.updateProductCartItem(order).then(final=>{
               resolve(final);
            });
        });
      };
      let redoPrice = (order)=>{
        return new Promise((resolve,reject)=>{
            order.cart[order.selectItem].checkPrice = false;
            order.cart[order.selectItem].product.price = order.editCart.redo[order.selectItem].product.price;
            this.updateProductCartItem(order).then(final=>{
               resolve(final);
            });
        });
      };
      return new Promise((resolve,reject)=>{
        this.getOrderSelected().then(order=>{
           let mode = order.editCart.mode;
           if(mode == "qty"){
             redoQty(order).then(callback=>{
               resolve(callback);
             });
           }else if(mode == "disc"){
             redoDisc(order).then(callback=>{
               resolve(callback);
             });
           }else if(mode == "price"){
             redoPrice(order).then(callback=>{
               resolve(callback);
             });
           }else{
             resolve(0);
           }
        });
      });
    }
    let updateDisc = (order) =>{
        return new Promise((resolve,reject)=>{
          if(order.cart[order.selectItem].product.discount){
            let percent = order.cart[order.selectItem].product.discount/100;
            let sum = order.editCart.redo[order.selectItem].product.price * percent;
            order.cart[order.selectItem].product.price = order.editCart.redo[order.selectItem].product.price - sum;
            this.updateProductCartItem(order).then(callback=>{
              resolve(callback);
            });
          }else{
            this.updateProductCartItem(order).then(callback=>{
              resolve(order);
            });
          }
        });
    }
    let enterQty = (input,order) =>{
      return new Promise<any>((resolve,reject)=>{
          console.log(order.editCart);
          let itemEdit = order.cart[order.selectItem];
          if(itemEdit.checkQty == undefined || itemEdit.checkQty == false){
            order.cart[order.selectItem].checkQty = true;
            order.cart[order.selectItem].qty = input;
          }else{
            order.cart[order.selectItem].qty = itemEdit.qty * 10 + input;
          }
          this.updateProductCartItem(order).then(final=>{
            resolve(final);
          });
      });
    }
    let enterDisc = (input,order) =>{
      return new Promise<any>((resolve,reject)=>{
          let itemEdit = order.cart[order.selectItem];
          if(itemEdit.product.discount == undefined || itemEdit.product.discount == false){
            order.cart[order.selectItem].product.discount = input;
            updateDisc(order).then(final=>{
              resolve(final);
            });
          }else if((order.cart[order.selectItem].product.discount * 10) <= 100){
            order.cart[order.selectItem].product.discount = itemEdit.product.discount * 10 + input;
            updateDisc(order).then(final=>{
              resolve(final);
            });
          }else{
            resolve(order);
          }
      });
    }
    let enterPrice = (input,order) =>{
      return new Promise<any>((resolve,reject)=>{
          let itemEdit = order.cart[order.selectItem];
          if(itemEdit.checkPrice == undefined || itemEdit.checkPrice == false){
            order.cart[order.selectItem].checkPrice = true;
            order.cart[order.selectItem].product.price = input;
          }else{
            order.cart[order.selectItem].product.price = itemEdit.product.price * 10 + input;
          }
          updateDisc(order).then(final=>{
            resolve(final);
          });
      });
    }
    let enterInput = (input) =>{
      return new Promise<any>((resolve,reject)=>{
        this.getOrderSelected().then(order=>{
           let mode = order.editCart.mode;
           if(mode == "qty"){
             enterQty(input,order).then(callback=>{
               resolve(callback);
             });
           }else if(mode == "disc"){
             enterDisc(input,order).then(callback=>{
               resolve(callback);
             });
           }else if(mode == "price"){
             enterPrice(input,order).then(callback=>{
               resolve(callback);
             });
           }else{
             resolve(0);
           }
        });
      });
    }
    return new Promise<any>((resolve,reject)=>{
      switch (input) {
        case -1:
          redoInput().then(callback=>{
            resolve(callback);
          });
        break;
        case -2:
          resolve(0);
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 0:
        enterInput(input).then(callback=>{
          resolve(callback);
        });
        break;
        default:
      }
    });
  }


  // Payment
  selectMethodPayment(index:number){
    return new Promise<OrderListArray>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          order.payment.select = index;
          this.setOrderSelected(order).then(finish=>{
            resolve(order);
          });
        }else{
          resolve(null);
        }
      });
    });
  }
  addMethodPayment(method:string){
    return new Promise<OrderListArray>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        let item;
        if(order.payment.method.length > 0){
          item = new PaymentMethod(method,order.payment.method[order.payment.select].result);
        }else{
          order.payment.balance = order.total;
          item = new PaymentMethod(method,order.total);
        }
        order.payment.method.push(item);
        order.payment.select = order.payment.method.length - 1;
        this.setOrderSelected(order).then(finish=>{
          resolve(order);
        });
      });
      
    });
  }
  removeMethodPayment(index:number){
    return new Promise<OrderListArray>((resolve,reject)=>{
      this.getOrderSelected().then(order=>{
        if(order){
          order.payment.method.splice(index, 1);
          if((order.payment.select-1) >= 0){
            order.payment.select = order.payment.select-1;
          }
          this.updatePayment(order).then(final=>{
            resolve(final);
          });
        }else{
          resolve(null);
        }
      });
    });
  }
  updatePayment(order:any){
      return new Promise<OrderListArray>((resolve,reject)=>{
        if(order.payment.method.length){
           order.payment.method.forEach((data,index)=>{
             if(index != 0){
               data.balance = order.payment.method[index - 1].result;
             }else{
               data.balance = order.total;;
             }
             data.result = data.balance - data.input;
             if(data.result < 0){
               data.change = (data.result * -1);
             }else{
               data.change = 0;
             }
           });
           order.payment.balance = order.payment.method[order.payment.method.length - 1].result;
           if(order.payment.balance <= 0){
             order.payment.change = (order.payment.balance * -1);
             order.payment.validate = true;
           }else{
             order.payment.change = 0;
             order.payment.validate = false;
           }
        }else{
           order.payment.balance = order.total;
           order.payment.change = 0;
           order.payment.validate = false;
        }
        this.setOrderSelected(order).then(finish=>{
          //console.log("UPDATE",order);
          resolve(order);
        });
      });
  }
  inputPaymentEdit(input:number){
    let initPayment = (order) => {
      return new Promise<OrderListArray>((resolve,reject)=>{
        if(order.payment.method.length == 0){
          let item = new PaymentMethod("cash",order.total);
          order.payment.method.push(item);
          order.payment.select = order.payment.method.length - 1;
          resolve(order);
        }else{
          resolve(order);
        }
      });
    };
    let removeInput = () => {
      return new Promise<any>((resolve,reject)=>{
        this.getOrderSelected().then(order=>{
          if(order.payment.method.length){
            order.payment.method[order.payment.select].input = 0;
            this.updatePayment(order).then(final=>{
               resolve(final);
            });
          }else{
            resolve(null);
          }
        });
      });
    };
    let enterFull = () =>{
      return new Promise<OrderListArray>((resolve,reject)=>{
          this.getOrderSelected().then(order=>{
            initPayment(order).then(callback=>{
              order = callback;
              order.payment.method[order.payment.select].input = order.payment.method[order.payment.select].balance;
              this.updatePayment(order).then(final=>{
               resolve(final);
              });
            });
          });
      });
    }
    let enterBank = (input)=>{
        return new Promise<OrderListArray>((resolve,reject)=>{
          this.getOrderSelected().then(order=>{
           initPayment(order).then(callback=>{
             order = callback;
             let itemEdit = order.payment.method[order.payment.select];
             order.payment.method[order.payment.select].input = itemEdit.input + input;
             this.updatePayment(order).then(final=>{
               resolve(final);
             });
           });
          });
        });
    }
    let enterInput = (input)=>{
         return new Promise<OrderListArray>((resolve,reject)=>{
           this.getOrderSelected().then(order=>{
             initPayment(order).then(callback=>{
               order = callback;
               let itemEdit = order.payment.method[order.payment.select];
               if(itemEdit.input == 0){
                 order.payment.method[order.payment.select].input = input;
               }else{
                 order.payment.method[order.payment.select].input = itemEdit.input * 10 + input;
               }
               this.updatePayment(order).then(final=>{
                 resolve(final);
               }); 
             });
           });
         });
    }
    return new Promise<OrderListArray>((resolve,reject)=>{
      switch (input) {
        case -1:
          removeInput().then(callback=>{
            resolve(callback);
          });
        break;
        case -2:
          resolve(null);
          break;
        case 999:
          enterFull().then(callback=>{
            resolve(callback);
          });
          break;
        case 10:
        case 20:
        case 50:
        case 100:
        case 500:
        case 1000:
        case 5000:
          enterBank(input).then(callback=>{
            resolve(callback);
          });
          break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 9:
        case 0:
          enterInput(input).then(callback=>{
            resolve(callback);
          });
        break;
        default:
      }
      
    });
  }


  //Product Local
  product_categories_list({product=[],cate_id=[]}){
    return new Promise<any>((resolve,reject)=>{
       this._query.product_categories_list({product,cate_id}).then(callback=>{
         if(callback){
          this.redux.changeProducts({ product_list:callback });
         }
         resolve(callback);
       });
    });
  }




}


