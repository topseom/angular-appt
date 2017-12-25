import { NgModule } from '@angular/core';
import { EcateFormService } from './providers/form'

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
        EcateFormService,
        {
            provide: SWIPER_CONFIG,
            useValue: DEFAULT_SWIPER_CONFIG
        }
    ]
})

export class EcateModule{}
