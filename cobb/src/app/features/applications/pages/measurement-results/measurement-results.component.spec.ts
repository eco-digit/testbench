jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MeasurementResultsComponent } from './measurement-results.component';
import { FileDataService } from '@services/file-data.service';
import { SnackbarService } from '@services/snackbar.service';
import { HelpSidebarStateService } from '@services/help-sidebar-state.service';
import { DatePipe } from '@angular/common';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { provideHttpClient } from '@angular/common/http';

describe('MeasurementResultsComponent', () => {
  let component: MeasurementResultsComponent;
  let fixture: ComponentFixture<MeasurementResultsComponent>;
  let fileServiceMock: any;
  let snackbarMock: any;

  beforeEach(async () => {
    fileServiceMock = {
      downloadCsv: jest.fn(),
    };

    snackbarMock = {
      show: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MeasurementResultsComponent],
      providers: [
        provideHttpClient(),
        DatePipe,
        { provide: FileDataService, useValue: fileServiceMock },
        { provide: SnackbarService, useValue: snackbarMock },

        {
          provide: HelpSidebarStateService,
          useValue: { sidebarOpen$: of(false) },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: new Map([['measurementId', '123']]),
            },
            parent: {
              snapshot: {
                paramMap: new Map([['applicationId', '456']]),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MeasurementResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show error if measurementId is missing', () => {
    jest.spyOn(component.route.snapshot.paramMap, 'get').mockReturnValue(null);
    component.downloadCsvFile();
    expect(snackbarMock.show).toHaveBeenCalledWith(
      'Measurement ID is missing.',
      SnackbarTypeEnum.ERROR,
    );
  });

  it('should show error if measurement is not completed', () => {
    component.measurementState = 'in_progress';
    component.downloadCsvFile();
    expect(snackbarMock.show).toHaveBeenCalledWith(
      'Measurement is not completed yet.',
      SnackbarTypeEnum.ERROR,
    );
  });

  it('should download CSV when completed', () => {
    component.measurementState = 'completed';
    const fakeBlob = new Blob(['fake content'], { type: 'application/zip' });
    fileServiceMock.downloadCsv.mockReturnValue(of({ body: fakeBlob }));

    component.downloadCsvFile();

    expect(fileServiceMock.downloadCsv).toHaveBeenCalledWith('123');
    expect(snackbarMock.show).toHaveBeenCalledWith(
      'results.zip downloaded successfully! It is now available for use.',
      SnackbarTypeEnum.SUCCESS,
    );
  });

  it('should show error if download fails', () => {
    component.measurementState = 'completed';
    fileServiceMock.downloadCsv.mockReturnValue(throwError(() => new Error()));

    component.downloadCsvFile();

    expect(snackbarMock.show).toHaveBeenCalledWith(
      'Something went wrong while downloading.. Please try again.',
      SnackbarTypeEnum.ERROR,
    );
  });
});
