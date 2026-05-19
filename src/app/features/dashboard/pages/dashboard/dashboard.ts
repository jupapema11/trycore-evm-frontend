import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../projects/services/project.service';
import { ActivityService } from '../../../activities/services/activity.service';
import { Project, ProjectPayload } from '../../../../core/models/project.model';
import { Activity, ActivityPayload } from '../../../../core/models/activity.model';
import { ProjectSummary } from '../../../../core/models/summary.model';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { FabAction, FabMenuComponent } from '../../../../shared/components/fab-menu/fab-menu.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule, FormsModule, BaseChartDirective, ModalComponent, FabMenuComponent]
})
export class DashboardComponent implements OnInit {
  readonly projects = signal<Project[]>([]);
  readonly activities = signal<Activity[]>([]);
  readonly summary = signal<ProjectSummary | null>(null);
  readonly selectedProjectId = signal<string>('');

  readonly isProjectModalOpen = signal(false);
  readonly isActivityModalOpen = signal(false);
  readonly projectEditingId = signal<string | null>(null);
  readonly activityEditingId = signal<string | null>(null);
  readonly requestInProgress = signal(false);

  projectForm: ProjectPayload = { name: '' };
  activityForm: ActivityPayload = {
    name: '',
    budgetAtCompletion: 0,
    plannedProgressPercent: 0,
    actualProgressPercent: 0,
    actualCost: 0
  };

  readonly fabActions = computed<FabAction[]>(() => [
    { id: 'createProject', label: 'Nuevo proyecto', icon: '📁' },
    { id: 'editProject', label: 'Editar proyecto', icon: '✏️', disabled: !this.selectedProjectId() },
    { id: 'deleteProject', label: 'Eliminar proyecto', icon: '🗑️', disabled: !this.selectedProjectId() },
    { id: 'createActivity', label: 'Nueva actividad', icon: '✅', disabled: !this.selectedProjectId() }
  ]);

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#eef0f6' } }
    },
    scales: {
      x: { ticks: { color: '#9da6c4' }, grid: { color: 'rgba(255,255,255,0.08)' } },
      y: { ticks: { color: '#9da6c4' }, grid: { color: 'rgba(255,255,255,0.08)' } }
    }
  };

  get barChartData(): ChartConfiguration<'bar'>['data'] {
    const activities = this.activities();
    return {
      labels: activities.map((activity) => activity.name),
      datasets: [
        {
          label: 'PV',
          data: activities.map((activity) => activity.pv ?? 0),
          backgroundColor: 'rgba(56, 189, 248, 0.75)'
        },
        {
          label: 'EV',
          data: activities.map((activity) => activity.ev ?? 0),
          backgroundColor: 'rgba(34, 197, 94, 0.75)'
        },
        {
          label: 'AC',
          data: activities.map((activity) => activity.actualCost ?? 0),
          backgroundColor: 'rgba(248, 113, 113, 0.75)'
        }
      ]
    };
  }

  constructor(
    private readonly projectService: ProjectService,
    private readonly activityService: ActivityService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects ?? []);
        if (this.selectedProjectId()) {
          const exists = projects.some((project) => project.id === this.selectedProjectId());
          if (!exists) {
            this.selectedProjectId.set('');
            this.activities.set([]);
            this.summary.set(null);
          }
        }
      },
      error: (error) => console.error('Error cargando proyectos:', error)
    });
  }

  loadProjectData(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.activityService.getActivities(projectId).subscribe({
      next: (activities) => {
        this.activities.set(activities ?? []);
      },
      error: (error) => console.error('Error cargando actividades:', error)
    });

    this.projectService.getProjectSummary(projectId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
      },
      error: (error) => console.error('Summary error', error)
    });
  }

  onProjectChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const projectId = selectElement.value;
    if (!projectId) {
      this.selectedProjectId.set('');
      this.activities.set([]);
      this.summary.set(null);
      return;
    }
    this.loadProjectData(projectId);
  }

  onFabAction(action: string): void {
    switch (action) {
      case 'createProject':
        this.openCreateProjectModal();
        break;
      case 'editProject':
        this.openEditProjectModal();
        break;
      case 'deleteProject':
        this.deleteProject();
        break;
      case 'createActivity':
        this.openCreateActivityModal();
        break;
      default:
        break;
    }
  }

  openCreateProjectModal(): void {
    this.projectEditingId.set(null);
    this.projectForm = { name: '' };
    this.isProjectModalOpen.set(true);
  }

  openEditProjectModal(): void {
    const selected = this.projects().find((project) => project.id === this.selectedProjectId());
    if (!selected) {
      return;
    }
    this.projectEditingId.set(selected.id);
    this.projectForm = { name: selected.name };
    this.isProjectModalOpen.set(true);
  }

  closeProjectModal(): void {
    this.isProjectModalOpen.set(false);
  }

  saveProject(): void {
    const name = this.projectForm.name.trim();
    if (!name || this.requestInProgress()) {
      return;
    }

    this.requestInProgress.set(true);
    const payload: ProjectPayload = { name };
    const editingId = this.projectEditingId();
    const request = editingId
      ? this.projectService.updateProject(editingId, payload)
      : this.projectService.createProject(payload);

    request.subscribe({
      next: (project) => {
        this.closeProjectModal();
        this.loadProjects();
        if (project?.id) {
          this.loadProjectData(project.id);
        }
      },
      error: (error) => console.error('Error guardando proyecto:', error),
      complete: () => this.requestInProgress.set(false)
    });
  }

  deleteProject(): void {
    const projectId = this.selectedProjectId();
    if (!projectId) {
      return;
    }
    if (!confirm('¿Eliminar este proyecto y todas sus actividades?')) {
      return;
    }

    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
        this.selectedProjectId.set('');
        this.activities.set([]);
        this.summary.set(null);
        this.loadProjects();
      },
      error: (error) => console.error('Error eliminando proyecto:', error)
    });
  }

  openCreateActivityModal(): void {
    if (!this.selectedProjectId()) {
      return;
    }
    this.activityEditingId.set(null);
    this.activityForm = {
      name: '',
      budgetAtCompletion: 0,
      plannedProgressPercent: 0,
      actualProgressPercent: 0,
      actualCost: 0
    };
    this.isActivityModalOpen.set(true);
  }

  openEditActivityModal(activity: Activity): void {
    this.activityEditingId.set(activity.id);
    this.activityForm = {
      name: activity.name,
      budgetAtCompletion: activity.budgetAtCompletion,
      plannedProgressPercent: activity.plannedProgressPercent,
      actualProgressPercent: activity.actualProgressPercent,
      actualCost: activity.actualCost
    };
    this.isActivityModalOpen.set(true);
  }

  closeActivityModal(): void {
    this.isActivityModalOpen.set(false);
  }

  saveActivity(): void {
    const projectId = this.selectedProjectId();
    if (!projectId || !this.activityForm.name.trim() || this.requestInProgress()) {
      return;
    }

    this.requestInProgress.set(true);
    const payload: ActivityPayload = {
      ...this.activityForm,
      name: this.activityForm.name.trim()
    };

    const editingId = this.activityEditingId();
    const request = editingId
      ? this.activityService.updateActivity(projectId, editingId, payload)
      : this.activityService.createActivity(projectId, payload);

    request.subscribe({
      next: () => {
        this.closeActivityModal();
        this.loadProjectData(projectId);
      },
      error: (error) => console.error('Error guardando actividad:', error),
      complete: () => this.requestInProgress.set(false)
    });
  }

  deleteActivity(activityId: string): void {
    const projectId = this.selectedProjectId();
    if (!projectId) {
      return;
    }
    if (!confirm('¿Eliminar esta actividad?')) {
      return;
    }

    this.activityService.deleteActivity(projectId, activityId).subscribe({
      next: () => this.loadProjectData(projectId),
      error: (error) => console.error('Error eliminando actividad:', error)
    });
  }

  trackByProjectId(_: number, project: Project): string {
    return project.id;
  }

  trackByActivityId(_: number, activity: Activity): string {
    return activity.id;
  }
}