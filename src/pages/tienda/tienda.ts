import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ActionSheetController, AlertController, ModalController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { TiendaGaleriaPage } from '../tienda-galeria/tienda-galeria';
import { DataProvider } from '../../providers/data/data';
import { TiendaNuevoPage } from '../tienda-nuevo/tienda-nuevo';
import { TiendaProductoPage } from '../tienda-producto/tienda-producto';
import { TiendaHorarioPage } from '../tienda-horario/tienda-horario';
import { GaleriaImagenPage } from '../galeria-imagen/galeria-imagen';

@IonicPage()
@Component({
  selector: 'page-tienda',
  templateUrl: 'tienda.html',
})
export class TiendaPage {

  nuevo = TiendaNuevoPage;
  producto = TiendaProductoPage;
  tiendaID: string;
  tienda: any;
  imagenPerfil: string;

  constructor(
    public modalCtrl: ModalController,
    private alertCtrl: AlertController,
    public navCtrl: NavController,
    private platform: Platform,
    public navParams: NavParams,
    private _data: DataProvider,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController

  ) {
    this.tiendaID = this.navParams.get('id');
  }

  ionViewDidLoad() {
    this.cargarTienda();
  }

  cargarTienda() {
    this._data.fetchTienda(this.tiendaID)
      .then(data => {
        this.tienda = data; console.log(data);
      });
  }

  openModal(tipo) {
    const modal = this.modalCtrl.create(GaleriaImagenPage, { tipo });
    modal.onDidDismiss(data => {
    });
    modal.present();
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: 'Cargar desde galería',
          handler: () => {
            this.tomarFoto(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Usar cámara',
          handler: () => {
            this.tomarFoto(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  tomarFoto(sourceType) {
    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };

    if (this.platform.is('cordova')) {
      this.camera.getPicture(options).then((imageData) => {
        let base64Image = 'data:image/jpeg;base64,' + imageData;

        const body = {
          img: base64Image,
          id: this.tiendaID
        }
        this._data.nuevaImgPerfil(body)
          .then(() => this.cargarTienda());

      }, (err) => { console.log('ERROR') });
    } else {
      const img = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";

      const body = {
        img: 'data:image/png;base64,' + img,
        id: this.tiendaID
      }
      this._data.nuevaImgPerfil(body)
        .then(() => this.cargarTienda());
    }
  }



  openGaleria() {
    this.navCtrl.push(TiendaGaleriaPage, {
      galeria: this.tienda.galeria,
      id: this.tiendaID
    })
  }

  openPage(pagina) {
    this.navCtrl.push(pagina, { tipo: this.tienda.tipo, tiendaID: this.tiendaID });
  }

  openHorario() {
    this.navCtrl.push(TiendaHorarioPage);
  }

  presentPrompt(tipo) {

    let titulo = '';
    let inputType = '';
    if (tipo == 'nombre') {
      titulo = '¿Nombre de tu tienda?';
      inputType = 'text';
    }

    if (tipo == 'telefono') {
      titulo = '¿Teléfono de contacto?';
      inputType = 'tel';
    }

    let alert = this.alertCtrl.create({
      title: titulo,
      inputs: [
        {
          type: inputType,
          name: tipo,
          placeholder: 'Escribir'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Ok',
          handler: data => {
            if (tipo == 'nombre') {
              const body = { nombre: data.nombre };
              this._data.updateTienda(this.tiendaID, body)
                .then((data: any) => this.tienda = data);
            }
            if (tipo == 'telefono') {
              const body = { telefono: data.telefono };
              this._data.updateTienda(this.tiendaID, body)
                .then((data: any) => this.tienda = data);
            }
          }
        }
      ]
    });
    alert.present();
  }

}
