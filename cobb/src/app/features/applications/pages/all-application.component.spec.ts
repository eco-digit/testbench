import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllApplicationsComponent } from '@features/applications/pages/all-applications.component';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MeasurementService } from '@services/measurement.service';
import { DashboardStatistics } from '@models/measurement';
import { CreateApplicationComponent } from '@features/applications/pages/create-application/create-application.component';
import { provideHttpClient } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AllApplicationsComponent', () => {
  let component: AllApplicationsComponent;
  let fixture: ComponentFixture<AllApplicationsComponent>;
  let measurementServiceMock: any;
  let dialogMock: any;
  let helpSidebarStateMock: any;

  const mockStats: DashboardStatistics = {
    measurements: 10,
    applications: 5,
    criticalApplications: 2,
    disruptedApplications: 1,
  };

  beforeEach(async () => {
    measurementServiceMock = {
      getOverviewCounts: jest.fn().mockReturnValue(of(mockStats)),
    };

    dialogMock = {
      open: jest.fn(),
    };

    helpSidebarStateMock = {
      sidebarOpen$: of(true),
    };

    await TestBed.configureTestingModule({
      imports: [AllApplicationsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        { provide: MeasurementService, useValue: measurementServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: HelpSidebarStateService, useValue: helpSidebarStateMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllApplicationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should react to sidebar state observable', () => {
    expect(component.isHelpSidebarOpen).toBe(true);
  });

  it('should open the create application dialog', () => {
    component.openDialog();
    expect(dialogMock.open).toHaveBeenCalledWith(CreateApplicationComponent);
  });
});
