import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/Projects`;

  getSummary(projectId: string): Observable<any> {
    return this.http.get(`${this.api}/${projectId}/summary`);
  }

  getActivities(projectId: string): Observable<any> {
    return this.http.get(`${this.api}/${projectId}/activities`);
  }

  createProject(data: any): Observable<any> {
    return this.http.post(this.api, data);
  }
}