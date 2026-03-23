import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllApplicationsTableComponent } from './all-applications-table.component';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationsTableData } from '@models/applications';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { ErrorDisplayComponent } from '@components/error-display/error-display.component';
import { CommonModule } from '@angular/common';

describe('AllApplicationsTableComponent', () => {
  let component: AllApplicationsTableComponent;
  let fixture: ComponentFixture<AllApplicationsTableComponent>;
  let mockAppService: jest.Mocked<ApplicationsService>;
  let mockRouter: jest.Mocked<Router>;

  const mockData: ApplicationsTableData[] = [
    {
      applicationId: '1',
      applicationName: 'My App',
      healthStatus: 'HEALTHY',
      ecodigitScore: 22,
      lastMeasurement: {
        applicationId: '1',
        lastUpdated: '',
      },
    },
  ];

  beforeEach(async () => {
    mockAppService = {
      getAllApplicationsList: jest.fn().mockReturnValue(of(mockData)),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        AllApplicationsTableComponent,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatChipsModule,
        MatButtonModule,
        MatTooltipModule,
        NoopAnimationsModule,
        CommonModule,
        ErrorDisplayComponent,
        ScoreFormatterPipe,
      ],
      declarations: [],
      providers: [
        { provide: ApplicationsService, useValue: mockAppService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllApplicationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load applications and populate the table', () => {
    expect(mockAppService.getAllApplicationsList).toHaveBeenCalled();
    expect(component.dataSource.data).toEqual(mockData);
    expect(component.hasError).toBe(false);
  });
});
