import { NgModule } from '@angular/core';
import { PoslProductService } from './providers/product';
import { PoslRedux } from './providers/redux';

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
        PoslProductService,
        PoslRedux
    ]
})

export class PoslModule{}
