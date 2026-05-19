import { ChangeDetectorRef, Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ProjectService } from '../../../projects/services/project.service';
import { ActivityService } from '../../../activities/services/activity.service';
import { Activity, ActivityPayload } from '../../../../core/models/activity.model';
import { Project } from '../../../../core/models/project.model';
import { ProjectSummary } from '../../../../core/models/summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, FormsModule, BaseChartDirective]
})
export class DashboardComponent implements OnInit {
  projects = signal<Project[]>([]);
  activities = signal<Activity[]>([]);
  summary = signal<ProjectSummary | null>(null);
  selectedProjectId = signal<string | null>(null);

  showProjectModal = signal(false);
  showActivityModal = signal(false);
  editingActivityId = signal<string | null>(null);

  projectForm = { name: '' };
  activityForm: ActivityPayload = this.emptyActivityForm();

  chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const items = this.activities();
    return {
      labels: items.map((item) => item.name),
      datasets: [
        {
          label: 'PV',
          data: items.map((item) => item.pv),
          backgroundColor: 'rgba(56, 189, 248, 0.75)'
        },
        {
          label: 'EV',
          data: items.map((item) => item.ev),
          backgroundColor: 'rgba(34, 211, 165, 0.75)'
        },
        {
          label: 'AC',
          data: items.map((item) => item.actualCost),
          backgroundColor: 'rgba(244, 63, 94, 0.75)'
        }
      ]
    };
  });

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#eef0f6' }
      }
    },
    scales: {
      x: {
        ticks: { color: '#8b93b0' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        ticks: { color: '#8b93b0' },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    }
  };

  constructor(
    private readonly projectService: ProjectService,
    private readonly activityService: ActivityService,
    private readonly cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading projects', error)
    });
  }

  onProjectChange(event: Event): void {
    const projectId = (event.target as HTMLSelectElement).value;
    if (!projectId) {
      this.selectedProjectId.set(null);
      this.activities.set([]);
      this.summary.set(null);
      return;
    }
    this.loadProjectData(projectId);
  }

  loadProjectData(projectId: string): void {
    this.selectedProjectId.set(projectId);

    this.activityService.getActivities(projectId).subscribe({
      next: (activities) => this.activities.set(activities),
      error: (error) => console.error('Error loading activities', error)
    });

    this.projectService.getProjectSummary(projectId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.cd.detectChanges();
      },
      error: (error) => console.error('Error loading summary', error)
    });
  }

  openCreateProjectModal(): void {
    this.projectForm = { name: '' };
    this.showProjectModal.set(true);
  }

  closeProjectModal(): void {
    this.showProjectModal.set(false);
  }

  saveProject(): void {
    if (!this.projectForm.name.trim()) return;

    this.projectService.createProject(this.projectForm).subscribe({
      next: () => {
        this.closeProjectModal();
        this.loadProjects();
      },
      error: (error) => console.error('Error creating project', error)
    });
  }

  openCreateActivityModal(): void {
    this.editingActivityId.set(null);
    this.activityForm = this.emptyActivityForm();
    this.showActivityModal.set(true);
  }

  editActivity(activity: Activity): void {
    this.editingActivityId.set(activity.id);
    this.activityForm = {
      name: activity.name,
      budgetAtCompletion: activity.budgetAtCompletion,
      plannedProgressPercent: activity.plannedProgressPercent,
      actualProgressPercent: activity.actualProgressPercent,
      actualCost: activity.actualCost
    };
    this.showActivityModal.set(true);
  }

  closeActivityModal(): void {
    this.showActivityModal.set(false);
    this.editingActivityId.set(null);
  }

  saveActivity(): void {
    const projectId = this.selectedProjectId();
    if (!projectId || !this.activityForm.name.trim()) return;

    const request = this.editingActivityId()
      ? this.activityService.updateActivity(projectId, this.editingActivityId()!, this.activityForm)
      : this.activityService.createActivity(projectId, this.activityForm);

    request.subscribe({
      next: () => {
        this.closeActivityModal();
        this.loadProjectData(projectId);
      },
      error: (error) => console.error('Error saving activity', error)
    });
  }

  deleteActivity(activityId: string): void {
    const projectId = this.selectedProjectId();
    if (!projectId || !confirm('¿Eliminar esta actividad?')) return;

    this.activityService.deleteActivity(projectId, activityId).subscribe({
      next: () => this.loadProjectData(projectId),
      error: (error) => console.error('Error deleting activity', error)
    });
  }

  cpiStatusClass(value: number | undefined): string {
    if (!value) return 'status-neutral';
    if (value > 1) return 'status-good';
    if (value < 1) return 'status-bad';
    return 'status-neutral';
  }

  spiStatusClass(value: number | undefined): string {
    return this.cpiStatusClass(value);
  }

  private emptyActivityForm(): ActivityPayload {
    return {
      name: '',
      budgetAtCompletion: 0,
      plannedProgressPercent: 0,
      actualProgressPercent: 0,
      actualCost: 0
    };
  }
}
