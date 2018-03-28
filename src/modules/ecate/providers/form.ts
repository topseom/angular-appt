import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { StorageService,InsertService,SiteService,table } from 'ng-prov';
import { Events,ToastController,LoadingController,AlertController } from 'ionic-angular';
import * as _ from 'lodash';

export class Setting{
  offline = false;
}

@Injectable()
export class EcateFormService{
  dataSet = [
    {data:table.blog_category},
    {data:table.blog_list},
    {data:table.gallery_category},
    {data:table.gallery_single},
    {data:table.navigation},
    {data:table.page_single},
    {data:table.portfolio_category},
    {data:table.portfolio_single},
    {data:table.product_category},
    {data:table.product_list},
    {data:table.product_single},
    {data:table.images}
  ];
  
  //storeLocal = "dataSet";

  settingTitle = "setting";
  formTitle = "form";
  constructor(public site:SiteService,public _insert:InsertService,public loadingCtrl:LoadingController,public alertCtrl:AlertController,public _storage:StorageService,public event:Events,public toastCtrl:ToastController){}

  showConfig(){
    //this.site.showConfig();
  }

  //DataSet
  isData(){
    return new Promise<any>((resolve,reject)=>{
      this._storage.isData().then(callback=>{
          resolve(callback);
      });
    });
  }
  loadData(force=false){
    return new Promise<any>((resolve,reject)=>{
      this._storage.loadData(this.dataSet,force).then(callback=>{
        resolve(callback);
      });
    });
  }

  getLocalDataSet(table){
    return new Promise<any>((resolve,reject)=>{
      this._storage.getLocalData(table).then(cache=>{
          resolve(cache);
      });
    })
  }

  setSetting(setting :Setting){
    return new Promise<any>((resolve,reject)=>{
      this._storage.setLocal(this.settingTitle,setting).then(callback=>{
        resolve(1);
      });
    });
  }
  getSetting(){
    return new Promise<Setting>((resolve,reject)=>{
      this._storage.getLocal(this.settingTitle).then(callback=>{
        if(callback){
          resolve(callback) 
        }else{
          let setting = new Setting();
          resolve(setting);
        }
      });
    });
  }

  setForm(form,type){
    return new Promise<any>((resolve,reject)=>{
      this._storage.getSetting().then(setting=>{
        this._storage.setLocal(this.formTitle+'_'+type,form).then(callback=>{
          if(setting.offline){
            let alert = this.alertCtrl.create({
              title:"Attention!",
              message:"Please online to send data!",
              buttons:[{
                text:"Ok"
              }]
            })
            alert.present();
            resolve(0);
          }else{
            resolve(1);
          }
        });
      });
    });
  }
  getForm(type){
    return new Promise<any>((resolve,reject)=>{
      this._storage.getLocal(this.formTitle+'_'+type).then(callback=>{
        resolve(callback);
      });
    });
  }
  removeForm(type){
    return new Promise<any>((resolve,reject)=>{
      this._storage.removeLocal(this.formTitle+'_'+type).then(callback=>{
        resolve(callback);
      });
    });
  }


  user_form_insert(data,type,load=true){
    return new Promise<any>((resolve,reject)=>{
      resolve(1);
      /*this._insert.user_form({data,type,load}).then(callback=>{
        resolve(callback);
      });*/
    });
  }
  user_form_firebase_insert(data,type,load=true){
    return new Promise<any>((resolve,reject)=>{
      resolve(1);
      /*this._insert.user_form({data,type,load}).then(callback=>{
        resolve(callback);
      });*/
    });
  }

  validateForm(must,form){
    return new Promise<any>((resolve,reject)=>{
        let validate = [];
        let text;
        if(form['email']){
          let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          if(!re.test(form['email'])){
            text = " email correct format";
            validate.push(form['email']);
          }
        }
        _.forEach(must,function(value,key){
            _.forEach(form,function(v,k){
               if(key == k && !v){
                 if(!text){
                   text = key + " ";
                 }else{
                   text = text + key + " ";
                 }
                 validate.push(value);
               }        
            });
        });
        if(validate.length > 0){
          resolve(0);
          let alert = this.alertCtrl.create({
                    title: 'Attention',
                    subTitle: 'Please fill ' + text,
                    buttons: [{
                        text: 'Ok',
                        handler: () => {
                        }
                     }]
          });
          alert.present();
        }else{
          resolve(1);
        }
    });
  }

  async sendForm(form1,form2,type){
    let setting = await this._storage.getSetting();
    if(setting.offline){
      let alert = this.alertCtrl.create({
        title:"Attention",
        message:"Please online to send data!",
        buttons:[{
          text:"oK"
        }]
      });
      alert.present();
    }
    let callback = await this._insert.user_form({data:form1,other_data:form2,type});
    console.log("CALLBACK",callback);
    if(callback){
      await this.removeForm(type+'1');
      let alert = this.alertCtrl.create({
      title:"Attention",
          message:"Sending Form Successfull!",
          buttons:[{
            text:"oK"
          }]
      });
      alert.present();
      return(1);
    }
    let alert = this.alertCtrl.create({
        title:"Attention",
        message:"Sending Form Failure!",
        buttons:[{
          text:"oK"
        }]
    });
    alert.present();
    return(0);
  }
}


