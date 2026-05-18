import { Component, inject, OnInit } from '@angular/core';
import { ProjectService } from '../../../projects/services/project.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {

  private projectService = inject(ProjectService);

  summary: any;

  projectId = '721d55de-71f9-40de-9223-4b50786249a1';

  ngOnInit(): void {
    this.loadSummary();
  }

  loadSummary() {
    this.projectService.getSummary(this.projectId)
      .subscribe({
        next: (response) => {
          this.summary = response;
        }
      });
  }
}
