import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class PontoService {

    constructor(
        private httpClient: HttpClient,
    ) { }

    httpOptions = {
        headers: new HttpHeaders({
            "Content-Type": "application/json"
        })
    }

    getRegistros(userId:any): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/${userId}/datetime/recent`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    postRegistrar(userId:any, date:any, time:any): Observable<any> {
        return this.httpClient.post<any>(`${API_CONFIG.baseUrl}/user/${userId}/datetime`,{date, time} ,this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
        }
        return throwError(errorMessage);
    };

}
