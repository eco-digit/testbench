import { ApplicationContextTableComponent } from './application-context-table.component';
import { of } from 'rxjs';
import { ContextOverviewDto } from '@models/context';
import { HealthStatus } from '@enums/measurement-state.enum';

describe('ApplicationContextComponent', () => {
  let component: ApplicationContextTableComponent;
  let mockApplicationContextService: any;
  let mockActivatedRoute: any;
  let datePipe: any;

  const mockData: ContextOverviewDto[] = [
    {
      contextId: 'context 1',
      name: 'Context A',
      description: 'Description A',
      ecodigitScore: 80,
      healthStatus: HealthStatus.HEALTHY,
      lastMeasurement: null,
    },
    {
      contextId: 'context 2',
      name: 'Context B',
      description: 'Description B',
      ecodigitScore: 55,
      healthStatus: HealthStatus.CRITICAL,
      lastMeasurement: null,
    },
  ];

  beforeEach(() => {
    mockApplicationContextService = {
      getContexts: jest.fn().mockReturnValue(of(mockData)),
    };

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockReturnValue('app-123'),
        },
      },
    };

    component = new ApplicationContextTableComponent(
      mockApplicationContextService,
      mockActivatedRoute,
      datePipe,
    );
  });

  it('should load application contexts on init', () => {
    const emitSpy = jest.spyOn(component.measurementCountChange, 'emit');

    component.ngOnInit();

    expect(mockApplicationContextService.getContexts).toHaveBeenCalledWith(
      'app-123',
    );
    expect(component.dataSource.data).toEqual(mockData);
    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should return correct health status info for known state', () => {
    const info = component.getStatusInfo('HEALTHY');
    expect(info.label).toBe('healthy');
    expect(info.icon).toBe('mood');
  });

  it('should return unknown status info for unknown state', () => {
    const info = component.getStatusInfo('UNKNOWN');
    expect(info.label).toBe('unknown status');
    expect(info.status).toBe('status-unknown');
  });
});
