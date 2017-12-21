import { NgModule } from '@angular/core';
import { AuthService } from 'ng-prov';
import { EcomCartService } from './providers/cart';
import { EcomCouponService } from './providers/coupon';
import { EcomWishlistService } from './providers/wishlist';

@NgModule({
    providers:[
        AuthService,
        EcomCouponService,
        EcomCartService,
        EcomWishlistService
    ]
})

export class EcomModule{}
