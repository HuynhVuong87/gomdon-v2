import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { Router } from '@angular/router';
export interface IInfo {
  displayName: string;
  role: string;
  email: string;
  uid: string;
  photoURL: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  current_user = new BehaviorSubject<IInfo>(null);

  constructor(private afu: AngularFireAuth, private router: Router) {}

  // lấy thông tin user
  getInfo(): IInfo {
    return this.current_user.getValue();
  }

  // get token
  async getToken(): Promise<string | null> {
    return await firebase.auth().currentUser.getIdToken(true);
  }

  // lưu thông tin user
  setInfo(newInfo: IInfo): void {
    this.current_user.next(newInfo);
  }

  async signOut(): Promise<void> {
    await this.afu.signOut();
  }
  async signIn(email: string, password: string): Promise<void> {
    try {
      const u = await this.afu.signInWithEmailAndPassword(email, password);
      if (u) {
        console.log(u);
      }
    } catch (error) {}
  }
  async googleLogin(): Promise<void> {
    const provider = new firebase.auth.GoogleAuthProvider();
    const u = await this.afu.signInWithPopup(provider);
    if (u) {
      console.log(u);
      // this.router.navigate(['/home']);
    }
  }
}
