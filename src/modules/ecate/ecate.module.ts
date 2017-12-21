import { NgModule } from '@angular/core';
import { AuthService,InsertService } from 'ng-prov';
import { EcateFormService } from './providers/form'

@NgModule({
    providers:[
        AuthService,
        InsertService,
        EcateFormService
    ]
})

export class EcateModule{}
