import { Component } from "@angular/core";
import { MesPage } from "../mes/mes";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController,
  ModalController
} from "ionic-angular";

/**
 * Generated class for the CalendarioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-calendario",
  templateUrl: "calendario.html"
})
export class CalendarioPage {
  constructor(
    public modalCtrl: ModalController,
    public viewCtrl: ViewController,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {}
  close() {
    this.viewCtrl.dismiss();
  }

  openMes() {
    const modal = this.modalCtrl.create(MesPage);
    modal.present();
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad CalendarioPage");
  }
}
