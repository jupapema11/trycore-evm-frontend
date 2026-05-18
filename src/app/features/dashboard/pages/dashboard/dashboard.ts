import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../projects/services/project.service';
import { ActivityService } from '../../../activities/services/activity.service';
import { EvmService } from '../../../../core/services/evm.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  projects: any[] = [];
  activities: any[] = [];
  selectedProjectId: string | null = null;
  consolidatedIndicators: any = {};

  constructor(
    private projectService: ProjectService,
    private activityService: ActivityService,
    private evmService: EvmService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getProjects().subscribe((projects) => {
      this.projects = projects;
    });
  }

  loadActivities(projectId: string): void {
    this.selectedProjectId = projectId;
    this.activityService.getActivities(projectId).subscribe((activities) => {
      this.activities = activities;
      this.calculateConsolidatedIndicators();
    });
  }

  calculateConsolidatedIndicators(): void {
    let totalPV = 0;
    let totalEV = 0;
    let totalAC = 0;
    let totalBAC = 0;

    this.activities.forEach((activity) => {
      totalBAC += activity.budgetAtCompletion;
      totalPV += activity.plannedProgressPercent * activity.budgetAtCompletion;
      totalEV += activity.actualProgressPercent * activity.budgetAtCompletion;
      totalAC += activity.actualCost;
    });

    const CPI = totalEV / totalAC;
    const SPI = totalEV / totalPV;
    const EAC = totalBAC / CPI;
    const VAC = totalBAC - EAC;

    this.consolidatedIndicators = {
      totalPV,
      totalEV,
      totalAC,
      CPI,
      SPI,
      EAC,
      VAC,
    };
  }
}
