import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CreateApplicationContextComponent } from './create-application-context.component';
import { ContextService } from '@features/applications/services/context.service';
import { SnackbarService } from '@services/snackbar.service';
import { SnackbarTypeEnum } from '@enums/snackbar-type.enum';

describe('CreateApplicationContextComponent', () => {
  let component: CreateApplicationContextComponent;
  let fixture: ComponentFixture<CreateApplicationContextComponent>;
  let mockService: jest.Mocked<ContextService>;
  let mockSnackbar: jest.Mocked<SnackbarService>;
  let mockDialogRef: jest.Mocked<
    MatDialogRef<CreateApplicationContextComponent>
  >;

  beforeEach(async () => {
    mockService = {
      createContext: jest.fn(),
    } as any;

    mockSnackbar = {
      show: jest.fn(),
    } as any;

    mockDialogRef = {
      close: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        CreateApplicationContextComponent,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: ContextService, useValue: mockService },
        { provide: SnackbarService, useValue: mockSnackbar },
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            applicationId: 'app-123',
            appName: 'TestApp',
            description: 'Description',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateApplicationContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create context and handle success', () => {
    mockService.createContext.mockReturnValue(of({} as any));

    component.form.controls.appName.setValue('NewContext');
    component.form.controls.description.setValue('ContextDescription');
    component.onSubmit();

    expect(mockService.createContext).toHaveBeenCalledWith({
      name: 'NewContext',
      description: 'ContextDescription',
      applicationId: 'app-123',
    });
    expect(mockSnackbar.show).toHaveBeenCalledWith(
      'Application Context created successfully.',
      SnackbarTypeEnum.SUCCESS,
    );
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should not close dialog if service errors', () => {
    mockService.createContext.mockReturnValue(
      throwError(() => new Error('Failed')),
    );

    component.form.controls.appName.setValue('NewContext');
    component.form.controls.description.setValue('ContextDescription');
    component.onSubmit();
  });

  it('should show error if appName is empty', () => {
    component.form.controls.appName.setValue('');
    expect(component.hasAppNameRequiredError()).toBe(true);
  });
});
