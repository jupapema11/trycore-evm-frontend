import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private baseUrl = 'https://localhost:44391/api/Projects';

  constructor(private http: HttpClient) {}

  getProjects(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  createProject(project: { name: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, project);
  }

  getProjectSummary(projectId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${projectId}/summary`);
  }
}