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
    // get all 
    getTimeApprove(): Observable<any> {
        return this.httpClient.get<any>(`${API_CONFIG.baseUrl}/user/approve/time`, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    // patch para time === horaedata && horas deletadas pelo adm 
    patchTimeApproveUpdateIquals(idsRegistrosAtualizadosComHoraIgual: any): Observable<any> {
        const body = { ids: idsRegistrosAtualizadosComHoraIgual };
        return this.httpClient.patch<any>(`${API_CONFIG.baseUrl}/user/approve/patch`, body, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    //aprovar alteração de horas do usuario
    approveUpdate(idsNaoDeletados: any): Observable<any> {
        const body = { ids: idsNaoDeletados };
        return this.httpClient.patch<any>(`${API_CONFIG.baseUrl}/user/approve/patch/update`, body, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }
    approveInsert(idsNaoDeletados: any): Observable<any> {
        const body = { ids: idsNaoDeletados };
        return this.httpClient.patch<any>(`${API_CONFIG.baseUrl}/user/approve/patch/insert`, body, this.httpOptions)
            .pipe(
                retry(0),
                catchError(this.handleError)
            );
    }

    deleteInsertNoApprove(idsNaoDeletados: any): Observable<any> {
        const url = `${API_CONFIG.baseUrl}/user/approve/delete/insert`;
        const body = { ids: idsNaoDeletados };
        return this.httpClient.post<any>(url, body, this.httpOptions).pipe(
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
