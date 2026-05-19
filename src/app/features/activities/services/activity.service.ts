import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Activity, ActivityPayload } from '../../../core/models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  getActivities(projectId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/${projectId}/activities`);
  }

  createActivity(projectId: string, payload: ActivityPayload): Observable<Activity> {
    return this.http.post<Activity>(`${this.baseUrl}/${projectId}/activities`, payload);
  }

  updateActivity(
    projectId: string,
    activityId: string,
    payload: ActivityPayload
  ): Observable<Activity> {
    return this.http.put<Activity>(
      `${this.baseUrl}/${projectId}/activities/${activityId}`,
      payload
    );
  }

  deleteActivity(projectId: string, activityId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${projectId}/activities/${activityId}`
    );
  }
}
