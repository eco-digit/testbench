import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateApplicationComponent } from './create-application.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApplicationsService } from '@features/applications/services/applications.service';
import { Router } from '@angular/router';
import { SnackbarService } from '@services/snackbar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { of, throwError } from 'rxjs';
import { ApplicationData } from '@models/applications';
import { VersionService } from '@services/version.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CreateApplicationComponent', () => {
  let component: CreateApplicationComponent;
  let fixture: ComponentFixture<CreateApplicationComponent>;
  let mockService: jest.Mocked<ApplicationsService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;
  let mockRouter: jest.Mocked<Router>;
  let mockDialogRef: jest.Mocked<MatDialogRef<CreateApplicationComponent>>;

  beforeEach(async () => {
    mockService = {
      addApplications: jest.fn(),
    } as any;

    mockSnackbar = {
      show: jest.fn(),
    } as any;

    mockRouter = {
      navigate: jest.fn(),
    } as any;

    mockDialogRef = {
      close: jest.fn(),
    } as any;

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CreateApplicationComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ApplicationsService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: VersionService, useValue: { isBasisVersion: false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call addApplications and handle success', () => {
    const mockResponse: ApplicationData = { id: 1, name: 'App1' } as any;
    mockService.addApplications.mockReturnValue(of(mockResponse));
    component.applicationForm.get('appName')?.setValue('App1');
    component.applicationForm.get('description')?.setValue('My desc');

    component.createAppInfo();

    expect(mockService.addApplications).toHaveBeenCalledWith('App1', 'My desc');
    expect(mockSnackbar.show).toHaveBeenCalledWith(
      'Application created successfully!',
      SnackbarTypeEnum.SUCCESS,
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/applications',
      mockResponse,
    ]);
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should handle error when addApplications fails', () => {
    mockService.addApplications.mockReturnValue(
      throwError(() => new Error('Failed')),
    );
    component.applicationForm.get('appName')?.setValue('App2');
    component.applicationForm.get('description')?.setValue('Desc');

    component.createAppInfo();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
