import { NgModule } from '@angular/core';
import { PosProductService } from './providers/product';
import { PosRedux } from './providers/redux';

import { navigationReducer } from './reducers/navigation';
import { ordersReducer } from './reducers/orders';
import { productsReducer } from './reducers/products';

import { StoreModule } from '@ngrx/store';

@NgModule({
    imports:[
        StoreModule.forRoot({ navigation:navigationReducer,orders:ordersReducer,products:productsReducer })
    ],
    providers:[
        PosProductService,
        PosRedux
    ]
})

export class PosModule{}
