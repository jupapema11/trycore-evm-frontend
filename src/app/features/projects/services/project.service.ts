import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project, ProjectPayload } from '../../../core/models/project.model';
import { ProjectSummary } from '../../../core/models/summary.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/Projects`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.api);
  }

  createProject(payload: ProjectPayload): Observable<Project> {
    return this.http.post<Project>(this.api, payload);
  }

  updateProject(id: string, payload: ProjectPayload): Observable<Project> {
    return this.http.put<Project>(`${this.api}/${id}`, payload);
  }

  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getProjectSummary(projectId: string): Observable<ProjectSummary> {
    return this.http.get<ProjectSummary>(`${this.api}/${projectId}/summary`);
  }
}
