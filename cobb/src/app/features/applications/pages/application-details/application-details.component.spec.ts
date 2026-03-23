import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from '@angular/core/testing';
import { ApplicationDetailsComponent } from './application-details.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { MatDialog } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FileDataService } from '@services/file-data.service';
import { MeasurementService } from '@services/measurement.service';

window.ResizeObserver =
  window.ResizeObserver ||
  jest.fn().mockImplementation(() => ({
    disconnect: jest.fn(),
    observe: jest.fn(),
    unobserve: jest.fn(),
  }));

describe('ApplicationDetailsComponent', () => {
  let component: ApplicationDetailsComponent;
  let fixture: ComponentFixture<ApplicationDetailsComponent>;
  let mockApplicationsService: any;
  let mockHelpSidebar: any;
  let mockDialog: any;
  let mockFileDataService: any;
  let mockMeasurementService: any;

  const applicationId = 'app-123';
  beforeEach(async () => {
    mockApplicationsService = {
      getApplicationById: jest.fn().mockReturnValue(
        of({
          name: 'Test App',
          description: 'This is a test app',
        }),
      ),
    };

    mockHelpSidebar = {
      sidebarOpen$: of(true),
    };

    mockDialog = {
      open: jest.fn(),
    };

    mockFileDataService = {
      getFilesByApplicationId: jest.fn().mockReturnValue(of([])),
    };

    mockMeasurementService = {
      getOverviewCounts: jest.fn().mockReturnValue(of({})),
      listenToMeasurementUpdates: jest.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationDetailsComponent, NoopAnimationsModule],
      providers: [
        DatePipe,
        provideHttpClient(),
        { provide: MeasurementService, useValue: mockMeasurementService },
        { provide: FileDataService, useValue: mockFileDataService },
        { provide: ApplicationsService, useValue: mockApplicationsService },
        { provide: HelpSidebarStateService, useValue: mockHelpSidebar },
        { provide: MatDialog, useValue: mockDialog },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { applicationId },
              paramMap: {
                get: () => applicationId,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load application data on init', fakeAsync(() => {
    flush();
    expect(mockApplicationsService.getApplicationById).toHaveBeenCalledWith(
      applicationId,
    );
    expect(component.applicationName).toBe('Test App');
    expect(component.description).toBe('This is a test app');
  }));
});
