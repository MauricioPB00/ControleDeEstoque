import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class EmpresaService {

    constructor(
        private httpClient: HttpClient,
    ) { }

    httpOptions = {
        headers: new HttpHeaders({
            "Content-Type": "application/json"
        })
    }

    getHorasTrabalhadas(): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/empresa/horasCalculadas`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }

    getDadosPorUsuario(userId: any): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/empresa/${userId}/usuario`, this.httpOptions)
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
