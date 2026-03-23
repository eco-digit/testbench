import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllArtifactsTableComponent } from './all-artifacts-table.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ArtefactsService } from '@features/applications/services/artefact.service';
import { MeasurementService } from '@services/measurement.service';
import { SnackbarService } from '@services/snackbar.service';
import { provideHttpClient } from '@angular/common/http';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MeasurementState } from '@enums/measurement-state.enum';

describe('AllArtifactsTableComponent', () => {
  let component: AllArtifactsTableComponent;
  let fixture: ComponentFixture<AllArtifactsTableComponent>;
  let mockArtefactsService: any;
  let mockMeasurementService: any;
  let mockSnackbar: any;

  beforeEach(async () => {
    mockArtefactsService = {
      getArtefacts: jest.fn(),
    };
    mockMeasurementService = {
      createAndStartMeasurement: jest.fn(),
      stopMeasurement: jest.fn(),
    };
    mockSnackbar = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        AllArtifactsTableComponent,
        MatPaginatorModule,
        BrowserAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { contextId: '123' },
            },
          },
        },
        { provide: ArtefactsService, useValue: mockArtefactsService },
        { provide: MeasurementService, useValue: mockMeasurementService },
        { provide: SnackbarService, useValue: mockSnackbar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AllArtifactsTableComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch artefacts on init', () => {
    const mockArtefacts = [
      {
        id: 'a1',
        originalFileName: 'file1',
        lastMeasurement: { measurementState: MeasurementState.COMPLETED },
      },
    ];

    mockArtefactsService.getArtefacts.mockReturnValue(of(mockArtefacts));

    component.ngOnInit();

    expect(mockArtefactsService.getArtefacts).toHaveBeenCalledWith(
      '123',
      undefined,
    );
    expect(component.dataSource.data.length).toBe(1);
    expect(component.dataSource.data[0].lastMeasurement.measurementState).toBe(
      'COMPLETED',
    );
  });

  it('should start a measurement when toggled on', () => {
    const element: any = {
      id: 'a1',
      originalFileName: 'file1',
      lastMeasurement: { id: 'm1' },
      isRunning: false,
    };

    mockMeasurementService.createAndStartMeasurement.mockReturnValue(of({}));

    component.toggleMeasurement(element);

    expect(mockMeasurementService.createAndStartMeasurement).toHaveBeenCalled();
    expect(mockSnackbar.show).toHaveBeenCalledWith(
      'Measurement started successfully.',
      expect.anything(),
    );
    expect(element.isRunning).toBe(true);
  });

  it('should stop a measurement when toggled off', () => {
    const element: any = {
      id: 'a1',
      originalFileName: 'file1',
      lastMeasurement: { id: 'm1' },
      isRunning: true,
    };

    mockMeasurementService.stopMeasurement.mockReturnValue(of({}));

    component.toggleMeasurement(element); // stop call

    expect(mockMeasurementService.stopMeasurement).toHaveBeenCalledWith('m1');
    expect(mockSnackbar.show).toHaveBeenCalledWith(
      'Measurement stopped successfully.',
      expect.anything(),
    );
    expect(element.isRunning).toBe(false);
  });
});
