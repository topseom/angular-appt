import { NgModule } from '@angular/core';
import { PosProductService } from './providers/product';
import { PosRedux } from './providers/redux';

import { navigationReducer } from './reducers/navigation';
import { ordersReducer } from './reducers/orders';
import { productsReducer } from './reducers/products';

import { StoreModule } from '@ngrx/store';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    imports:[
        StoreModule.forRoot({ navigation:navigationReducer,orders:ordersReducer,products:productsReducer }),
        BrowserAnimationsModule,
        NgxDatatableModule,
        NgxChartsModule
    ],
    exports:[
        BrowserAnimationsModule,
        NgxDatatableModule,
        NgxChartsModule
    ],
    providers:[
        PosProductService,
        PosRedux
    ]
})

export class PosModule{}
