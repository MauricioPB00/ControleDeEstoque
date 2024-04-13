import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})

export class PainelService {

    constructor(
        private httpClient: HttpClient,
    ) { }

    httpOptions = {
        headers: new HttpHeaders({
            "Content-Type": "application/json"
        })
    }

    getHoras(): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/painel/buscahoras`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    postHorasCalculadas(date: any, usuario: any, hora: any, weekend: any): Observable<any> {
        return this.httpClient.post<any>(`${API_CONFIG.baseUrl}/user/painel/salvarhoras`, { date, usuario, hora, weekend }, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }

    getHorasCalculadas(): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/painel/buscahorasCalculadas`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    salvarHoraMesTrabalhado(registrosPorUsuario:any): Observable<any> {
        return this.httpClient.post<any>(`${API_CONFIG.baseUrl}/user/painel/salvarHoraMesTrabalhado`, registrosPorUsuario, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }

    salvarSabado(horaFormatada:any, userId:any): Observable<any> {
        return this.httpClient.post<any>(`${API_CONFIG.baseUrl}/user/painel/salvarSabado`, { horaFormatada, userId}, this.httpOptions)
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
