import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParamsOptions } from '@angular/common/http';
import { API_CONFIG } from '../config/api.config';
import { map, tap, retry, catchError } from 'rxjs/operators';
import { Observable, throwError, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  constructor(private httpClient: HttpClient,) { }

  httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "multipart/form-data"
    })
}
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<any>(`${API_CONFIG.baseUrl}/upload-file`, formData, this.httpOptions)
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
