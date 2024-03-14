import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { map, tap, retry, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AprovarService {

    constructor(private httpClient: HttpClient,) { }

    httpOptions = {
        headers: new HttpHeaders({
            "Content-Type": "application/json"
        })
    }
    getTimeApprove(): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/approve/time`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    patchTimeApproveUpdateIquals(idsRegistrosAtualizadosComHoraIgual:any): Observable<any> {
        console.log(idsRegistrosAtualizadosComHoraIgual);
        const body = { ids: idsRegistrosAtualizadosComHoraIgual }; 
        return this.httpClient.patch<any>(`${API_CONFIG.baseUrl}/user/approve/patch`, body ,this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }

    handleError(error: HttpErrorResponse) {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
            // Erro client
            errorMessage = error.error.message;
        } else {
            // Erro servidor
            errorMessage = `Código do erro: ${error.status}, ` + `menssagem: ${error.message}`;
        }
        return throwError(errorMessage);
    };

}
