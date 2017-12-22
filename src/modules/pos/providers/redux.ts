import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { CHANGE_NAVIGATION } from '../reducers/navigation';
import { CHANGE_ORDERS } from '../reducers/orders';
import { CHANGE_PRODUCT } from '../reducers/products';

@Injectable()
export class PosRedux{
    constructor(private store: Store<any>){
    }

    getNavigationStore():Observable<any>{
        return this.store.select('navigation');
    }

    getOrderList():Observable<any>{
        return this.store.select('orders');
    }
    getProducts():Observable<any>{
        return this.store.select('products');
    }

    changeProducts(product){
        this.store.dispatch({type:CHANGE_PRODUCT,product:product});   
    }

    changeOrders(orders){
        this.store.dispatch({type:CHANGE_ORDERS,orders:orders});   
    }

    changePage({page_view,component=false}){
        this.store.dispatch({type:CHANGE_NAVIGATION,navigation:{page_view,component}});
    }
}