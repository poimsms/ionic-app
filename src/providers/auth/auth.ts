import { Injectable } from "@angular/core";
import { Storage } from "@ionic/storage";
import { Platform } from 'ionic-angular';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { FirebaseMessaging } from '@ionic-native/firebase-messaging';
import { CarroProvider } from '../carro/carro';
import { ConfigProvider } from "../config/config";


@Injectable()
export class AuthProvider {
  apiURL: string;

  authState = new BehaviorSubject({ isAuth: false, authData: {} });

  constructor(
    private firebaseMessaging: FirebaseMessaging,
    private platform: Platform,
    private storage: Storage,
    public http: HttpClient,
    private _carro: CarroProvider,
    private _config: ConfigProvider
  ) {
    platform.ready().then(() => {
      this.loadStorage();
    });
    this.apiURL = this._config.apiURL;
  }

  loginIn(email, password) {
    return new Promise((resolve, reject) => {
      this.signIn(email, password).then((res: any) => {
        if (res.ok) {
          this.saveStorage(res.token, res.user);
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
  }

  loginUp(name, email, password) {
    return new Promise((resolve, reject) => {
      this.signUp(name, email, password).then((res: any) => {
        if (res.ok) {
          this.saveStorage(res.token, res.user);
          resolve(true);
        } else {
          resolve(false);
        }
      })
    });
  }

  loginUpFormulario(name, email, password) {
    return new Promise((resolve, reject) => {
      this.signUpForm(name, email, password).then((res: any) => {
        if (res.ok) {
          this.saveStorage(res.token, res.user);
          resolve({ ok: true, id: res.user._id });
        } else {
          resolve({ ok: false });
        }
      })
    });
  }

  logout(token, user) {
    this._carro.clearCart();
    this.removeStorage();

    if (user.isDelivery) {
      this.unsubscribeToNotifications('delivery');
    }

    if (user.isTienda) {
      this.unsubscribeToNotifications(user.tienda.id);
    }
    const authData = {};
    this.authState.next({ isAuth: false, authData });
  }

  isAuthenticated() {
    return this.authState.value;
  }

  saveStorage(token, user) {
    const authData = { user, token };
    if (this.platform.is("cordova")) {
      this.storage.set("authData", JSON.stringify(authData));
      this.authState.next({ isAuth: true, authData });

    } else {
      localStorage.setItem("authData", JSON.stringify(authData));
      this.authState.next({ isAuth: true, authData });
    }
  }

  async updateUserStorage(token) {
    try {
      const resUser: any = await this.getUser(token);
      this.saveStorage(token, resUser.user);
    } catch (error) {
      console.log("Error", error);
    }
  }

  loadStorage() {
    if (this.platform.is('cordova')) {
      this.storage.get('authData').then(res => {

        if (res) {
          const authData = { user: JSON.parse(res).user, token: JSON.parse(res).token };
          this.authState.next({ isAuth: true, authData });
        } else {
          const authData = {};
          this.authState.next({ isAuth: false, authData });
        }
      });
    } else {
      if (localStorage.getItem('authData')) {
        const res = localStorage.getItem('authData');

        const authData = { user: JSON.parse(res).user, token: JSON.parse(res).token };
        this.authState.next({ isAuth: true, authData });

      } else {
        const authData = {};
        this.authState.next({ isAuth: false, authData });
      }
    }
  }

  removeStorage() {
    if (this.platform.is("cordova")) {
      this.storage.remove("authData");
    } else {
      localStorage.removeItem("authData");
    }
  }

  signIn(email, password) {
    const url = `${this.apiURL}/users/signin`;
    const body = { email, password };
    return this.http.post(url, body).toPromise();
  }

  signUp(name, email, password) {
    const url = `${this.apiURL}/users/signup`;
    const body = { name, email, password };
    return this.http.post(url, body).toPromise();
  }

  signUpForm(name, email, password) {
    const url = `${this.apiURL}/users/signup`;
    const body = { name, email, password, isTienda: true };
    return this.http.post(url, body).toPromise();
  }

  checkEmail(email) {
    const url = `${this.apiURL}/users/check-email`;
    const body = { email };
    return this.http.post(url, body).toPromise();
  }

  actualizarUsuario(body, id) {
    const url = `${this.apiURL}/users/actualizar/${id}`;
    return this.http.post(url, body).toPromise();
  }

  obtenerUsuario() {
    const url = `${this.apiURL}/users/me`;
    return this.http.get(url).toPromise();
  }

  getUser(token) {
    const url = `${this.apiURL}/users/me`;
    const headers = new HttpHeaders({
      Authorization: `JWT ${token}`
    });
    return this.http.get(url, { headers }).toPromise();
  }
  // -------------------------------------------
  //  SUBSCRIBIRSE A NOTIFICACIONES
  // -------------------------------------------

  subscribeToNotifications(topic) {
    if (!this.platform.is('cordova')) {
      return
    }
    return this.firebaseMessaging.subscribe(topic);
  }

  unsubscribeToNotifications(topic) {
    if (!this.platform.is('cordova')) {
      return
    }
    return this.firebaseMessaging.unsubscribe(topic);
  }

}
