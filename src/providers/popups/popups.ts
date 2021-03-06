import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular';
import { ConfigProvider } from '../config/config';


@Injectable()
export class PopupsProvider {

  categoriasEcommerce = {};
  categoriasOnce = {};
  categoriasComida = {};
  mensajeHome = '';
  apiURL: string;

  constructor(
    private appVersion: AppVersion,
    private platform: Platform,
    public http: HttpClient,
    private _config: ConfigProvider
  ) {
    platform.ready().then(() => {
      this.loadServerParams();
    });
    this.apiURL = this._config.apiURL;
  }

  loadServerParams() {
    const url = `${this.apiURL}/popups/parametros`;
    this.http.get(url).toPromise()
      .then((data: any) => {
        this.categoriasEcommerce = data.categoriasEcommerce;
        this.categoriasOnce = data.categoriasOnce;
        this.categoriasComida = data.categoriasComida;
        this.mensajeHome = data.mensajeHome;
      });
  }

  getCategorias() {
    const url = `${this.apiURL}/popups/categorias`;
    return this.http.get(url).toPromise();
  }

  async checkAppVersion(token) {
    if (this.platform.is('cordova')) {
      const version = await this.appVersion.getVersionNumber();
      const url = `${this.apiURL}/popups/app-version`;
      const headers = new HttpHeaders({
        Authorization: `JWT ${token}`
      });
      const body = { version };
      return this.http.post(url, body, { headers }).toPromise();
    } else {
      const version = '0.5.0';
      const url = `${this.apiURL}/popups/app-version`;
      const headers = new HttpHeaders({
        Authorization: `JWT ${token}`
      });
      const body = { version };
      return this.http.post(url, body, { headers }).toPromise();
    }
  }
}
