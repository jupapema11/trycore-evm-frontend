import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private baseUrl = 'https://localhost:44391/api/projects';

  constructor(private http: HttpClient) {}

  getActivities(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${projectId}/activities`);
  }

  createActivity(projectId: string, activity: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${projectId}/activities`, activity);
  }
}