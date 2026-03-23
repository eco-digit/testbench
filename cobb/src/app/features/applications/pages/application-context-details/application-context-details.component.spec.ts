import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplicationContextDetailsComponent } from './application-context-details.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { ContextService } from '@features/applications/services/context.service';
import { MeasurementState } from '@enums/measurement-state.enum';
import { MeasurementOverviewData } from '@models/measurement';

describe('ApplicationContextDetailsComponent', () => {
  let component: ApplicationContextDetailsComponent;
  let fixture: ComponentFixture<ApplicationContextDetailsComponent>;
  let mockApplicationContextService: any;

  beforeEach(async () => {
    mockApplicationContextService = {
      getContextById: jest.fn(),
      getAllMeasurementsByContext: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ApplicationContextDetailsComponent],
      providers: [
        DatePipe,
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('123'),
              },
            },
          },
        },
        {
          provide: ContextService,
          useValue: mockApplicationContextService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApplicationContextDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load context data on init', () => {
    const mockContext = {
      name: 'Test Context',
      description: 'Test Description',
    };

    const mockMeasurements: MeasurementOverviewData[] = [
      {
        name: 'Measurement 1',
        description: 'Desc 1',
        measurementState: MeasurementState.COMPLETED, // ✅ completed
        ecodigitScore: 42,
        lastUpdated: new Date().toISOString(),
        adp: 1,
        ced: 2,
        gwp: 3,
        water: 4,
        weee: 5,
        tox: 6,
        id: 'm1',
        applicationVariantName: 'Variant A',
        simulationDuration: 123,
        trigger: 'USER',
      } as MeasurementOverviewData,
      {
        name: 'Measurement 2',
        description: 'Desc 2',
        measurementState: MeasurementState.CREATED,
      } as MeasurementOverviewData,
    ];

    mockApplicationContextService.getContextById.mockReturnValue(
      of(mockContext),
    );
    mockApplicationContextService.getAllMeasurementsByContext.mockReturnValue(
      of(mockMeasurements),
    );

    component.ngOnInit();

    expect(mockApplicationContextService.getContextById).toHaveBeenCalledWith(
      '123',
    );
    expect(
      mockApplicationContextService.getAllMeasurementsByContext,
    ).toHaveBeenCalledWith('123');

    expect(component.contextName).toBe('Test Context');
    expect(component.description).toBe('Test Description');

    expect(component.normalizedMeasurements.length).toBe(1);
    expect(component.normalizedMeasurements[0].name).toBe('Measurement 1');

    expect(component.atLeastOneMeasurementIsCompleted).toBe(true);
  });
});
