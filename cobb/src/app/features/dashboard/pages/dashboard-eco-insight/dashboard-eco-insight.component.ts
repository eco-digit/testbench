import { Component, OnInit } from '@angular/core';
import { EcoInsightChartComponent } from '@components/eco-insight-chart/eco-insight-chart.component';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { EcoData } from '@models/applications';
import { RoundUpPipe } from '@pipes/roundUp.pipe';

@Component({
  selector: 'app-dashboard-eco-insight',
  standalone: true,
  imports: [EcoInsightChartComponent, RoundUpPipe],
  templateUrl: './dashboard-eco-insight.component.html',
  styleUrl: './dashboard-eco-insight.component.scss',
})
export class DashboardEcoInsightComponent implements OnInit {
  ecoData?: EcoData;

  constructor(readonly applicationService: ApplicationsService) {}

  ngOnInit() {
    this.getEnvironmentData();
  }

  getEnvironmentData(): void {
    this.applicationService.getEcoIndicators().subscribe({
      next: (data) => {
        this.ecoData = data;
      },
      error: (err) => {
        console.error('Error while loading the environment data:', err);
      },
    });
  }
}
