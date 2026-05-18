import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../../projects/services/project.service';
import { ActivityService } from '../../../activities/services/activity.service';
import { EvmService } from '../../../../core/services/evm.service';

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
    CPI: 0,
    SPI: 0,
    EAC: 0,
    VAC: 0
  };

  constructor(
    private projectService: ProjectService,
    private activityService: ActivityService,
    private evmService: EvmService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProjects();
  }

  // ✅ FIX: agrega getProjects en service
  loadProjects(): void {
    this.projectService.getProjects().subscribe({
      next: (projects: any[]) => {
        this.projects = projects;
        console.log('Projects loaded:', this.projects);
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading projects', err);
      }
    });
  }

  // ✅ FIX: tipado seguro del event o string
  loadActivities(projectId: string): void {
    this.selectedProjectId = projectId;

    this.activityService.getActivities(projectId).subscribe({
      next: (activities) => {
        this.activities = activities;

        // 🔥 tomar indicadores directamente de backend
        const first = activities[0];

        this.consolidatedIndicators = {
          totalPV: first.pv,
          totalEV: first.ev,
          totalAC: first.cv ? Math.abs(first.cv) : 0,
          CPI: first.cpi,
          SPI: first.spi,
          EAC: first.eac,
          VAC: first.vac
        };
      }
    });
  }

  // ✅ FIX: evita NaN / division by zero
  calculateConsolidatedIndicators(): void {

    let totalPV = 0;
    let totalEV = 0;
    let totalAC = 0;
    let totalBAC = 0;

    for (const activity of this.activities) {

      const bac = activity.budgetAtCompletion ?? 0;
      const planned = activity.plannedProgressPercent ?? 0;
      const actual = activity.actualProgressPercent ?? 0;
      const ac = activity.actualCost ?? 0;

      totalBAC += bac;
      totalPV += planned * bac;
      totalEV += actual * bac;
      totalAC += ac;
    }

    const CPI = totalAC !== 0 ? totalEV / totalAC : 0;
    const SPI = totalPV !== 0 ? totalEV / totalPV : 0;
    const EAC = CPI !== 0 ? totalBAC / CPI : 0;
    const VAC = totalBAC - EAC;

    this.consolidatedIndicators = {
      totalPV,
      totalEV,
      totalAC,
      CPI,
      SPI,
      EAC,
      VAC
    };
  }
}