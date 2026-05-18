import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../projects/services/project.service';
import { ActivityService } from '../../../activities/services/activity.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {

  projects: any[] = [];
  activities: any[] = [];

  selectedProjectId: string | null = null;

  consolidatedIndicators: any = {
    totalPV: 0,
    totalEV: 0,
    totalAC: 0,
    totalCPI: 0,
    totalSPI: 0,
    totalEAC: 0,
    totalVAC: 0
  };

  constructor(
    private projectService: ProjectService,
    private activityService: ActivityService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  // ======================
  // LOAD PROJECTS
  // ======================
  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: any[]) => {
        this.projects = projects ?? [];
      },
      error: (err) => console.error(err)
    });
  }

  // ======================
  // ON SELECT PROJECT
  // ======================
  loadActivities(projectId: string): void {

    this.selectedProjectId = projectId;

    // 1. ACTIVITIES
    this.activityService.getActivities(projectId).subscribe({
      next: (activities) => {
        this.activities = activities ?? [];
      }
    });

    // 2. SUMMARY (🔥 IMPORTANTE)
    this.projectService.getProjectSummary(projectId).subscribe({
      next: (summary) => {

        this.consolidatedIndicators = {
          totalPV: summary.totalPV,
          totalEV: summary.totalEV,
          totalAC: summary.totalAC,
          totalCPI: summary.totalCPI,
          totalSPI: summary.totalSPI,
          totalEAC: summary.totalEAC,
          totalVAC: summary.totalVAC
        };

        this.cd.detectChanges();
      },
      error: (err) => console.error('Summary error', err)
    });
  }

  onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const projectId = selectElement.value;

    if (!projectId) return;

    this.loadActivities(projectId);
  }
}