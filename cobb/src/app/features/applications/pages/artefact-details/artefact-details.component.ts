import { Component, OnInit, ViewChild } from '@angular/core';
import { ApplicationContextTableComponent } from '@features/applications/pages/application-details/pages/application-context/application-context-table.component';
import { CommonModule, DatePipe } from '@angular/common';
import { EcoInsightsScreenComponent } from '@components/eco-insights-screen/eco-insights-screen.component';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatMiniFabButton } from '@angular/material/button';
import {
  MatTab,
  MatTabChangeEvent,
  MatTabGroup,
  MatTabLabel,
} from '@angular/material/tabs';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatTableModule } from '@angular/material/table';
import { ArtefactsService } from '@features/applications/services/artefact.service';
import { AllArtefactMeasurementsTableComponent } from '@features/applications/pages/artefact-details/pages/all-artefact-measurements-table/all-artefact-measurements-table.component';

@Component({
  selector: 'app-artefact-details',
  standalone: true,
  imports: [
    ApplicationContextTableComponent,
    DatePipe,
    EcoInsightsScreenComponent,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMiniFabButton,
    MatTab,
    MatTabGroup,
    MatTabLabel,
    MatTableModule,
    CommonModule,
    RouterOutlet,
    MatMenuTrigger,
    AllArtefactMeasurementsTableComponent,
  ],
  templateUrl: './artefact-details.component.html',
  styleUrl: './artefact-details.component.scss',
})
export class ArtefactDetailsComponent implements OnInit {
  isHelpSidebarOpen = false;

  selectedTabIndex = 0;
  contextId!: string;
  artefactId!: string;
  fileName?: string;
  measurementCount?: number;

  @ViewChild('measurementsArtefactTable')
  allArtefactMeasurementsTableComponent!: AllArtefactMeasurementsTableComponent;

  constructor(
    private helpSidebarState: HelpSidebarStateService,
    private artefactsService: ArtefactsService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const artefactId = this.route.snapshot.paramMap.get('artefactId');
    if (!artefactId) {
      console.error('artefactId is undefined');
      return;
    }
    this.artefactId = artefactId;
    this.artefactsService
      .getArtefactById(this.artefactId)
      .subscribe((artefact) => {
        this.fileName = artefact.originalFileName;
      });
  }

  onTabChange(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;

    this.helpSidebarState.sidebarOpen$.subscribe((isOpen) => {
      this.isHelpSidebarOpen = isOpen;
    });
  }
}
