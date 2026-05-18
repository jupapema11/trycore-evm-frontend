import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvmService {
  private baseUrl = 'https://localhost:44391/api/Evm';

  constructor(private http: HttpClient) {}

  getPV(plannedPercent: number, bac: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/pv`, {
      params: {
        plannedPercent: plannedPercent.toString(),
        bac: bac.toString(),
      },
    });
  }

  getEV(actualPercent: number, bac: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/ev`, {
      params: {
        actualPercent: actualPercent.toString(),
        bac: bac.toString(),
      },
    });
  }
}