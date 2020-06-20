import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  async signIn(username, password) {
    try {
      const { refresh, access } = await this.http.post<any>("auth/jwt/create/", { username, password })
        .toPromise();
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
    } catch (error) {
      throw error;
    }
  }

  signUp(user: User) {
    return this.http.post<User>('auth/users/', user).toPromise();
  }

  async signOut() {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      throw error;
    }
  }

  async activate(uid, token) {   
    try {   
      await this.http.post('auth/users/activation/', { uid, token }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  async resendActivationLink(email) {
    try {
      await this.http.post('auth/users/resend_activation/', { email }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  async changePassword(current_password, new_password, re_new_password) {
    try {
      await this.http.post('auth/users/set_password/', {
        current_password,
        new_password,
        re_new_password
      }).toPromise();
    } catch (error) {
      throw error;
    }
  }

  sendResetPasswordEmail(email) {
    return this.http.post('auth/users/reset_password/', { email }).toPromise();
  }

  resetPassword(uid, token, newPassword, reNewPassword) {
    return this.http.post('auth/users/reset_password_confirm/', {
      uid,
      token,
      new_password: newPassword,
      re_new_password: reNewPassword
    }).toPromise();
  }

  changeUsername(password, newUsername, reNewUsername) {
    const body = {
      current_password: password,
      new_username: newUsername,
      re_new_username: reNewUsername
    };
    return this.http.post('auth/users/set_username/', body).toPromise();
  }

  deleteAccount(password) {
    const body = {
      current_password: password
    };
    return this.http.request('delete', 'auth/users/me/', { body }).toPromise();
  }

  get isAuthenticated() {
    return !!(localStorage.getItem('access_token') && localStorage.getItem('refresh_token'));
  }

  async getUserData() {
    try {
      return await this.http.get<User>('auth/users/me/').toPromise();
    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async editUserData(data) {
    return this.http.patch('auth/users/me/', { ...data }).toPromise();
  }

}
