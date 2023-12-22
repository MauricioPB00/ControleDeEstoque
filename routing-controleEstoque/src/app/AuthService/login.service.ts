

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BASE_URL } from '../base-url'; 

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private baseUrl = BASE_URL; 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    console.log('Resposta do service :', username, password);

    const url = `${this.baseUrl}/api/login_check`; 

    const loginData = {
      username,
      password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(url, loginData, { headers });
  }
}
