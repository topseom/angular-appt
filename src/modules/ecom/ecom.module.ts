import { NgModule } from '@angular/core';
import { AuthService } from 'ng-prov';
import { EcomCartService } from './providers/cart';
import { EcomCouponService } from './providers/coupon';
import { EcomWishlistService } from './providers/wishlist';

import { SwiperModule,SwiperConfigInterface,SWIPER_CONFIG } from 'ngx-swiper-wrapper';

export const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
    direction: 'horizontal',
    slidesPerView: 'auto',
    keyboard: true
};

@NgModule({
    imports: [
        SwiperModule
    ],
    exports:[
        SwiperModule
    ],
    providers:[
        AuthService,
        EcomCouponService,
        EcomCartService,
        EcomWishlistService,
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        }
    ]
})

export class EcomModule{}
