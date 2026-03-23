import { EditApplicationComponent } from './edit-application.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditApplicationData } from '@models/applications';

describe('EditApplicationComponent', () => {
  let component: EditApplicationComponent;
  let fixture: ComponentFixture<EditApplicationComponent>;

  const mockDialogRef = {
    close: jest.fn(),
  } satisfies Pick<MatDialogRef<EditApplicationComponent>, 'close'>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditApplicationComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            appName: 'TestName',
            description: 'TestBeschreibung',
          } satisfies Partial<EditApplicationData>,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should prefill form controls', () => {
    expect(component.form.value).toEqual({
      appName: 'TestName',
      description: 'TestBeschreibung',
    });
  });

  it('should have required error on appName when empty', () => {
    component.form.get('appName')?.setValue('');
    expect(component.form.get('appName')?.hasError('required')).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('onSubmit should NOT close dialog when form is invalid', () => {
    component.form.get('appName')?.setValue('');
    component.onSubmit();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('onSubmit should close dialog with form values when valid', () => {
    component.form.setValue({
      appName: 'Neuer Name',
      description: 'Neue Beschreibung',
    });

    component.onSubmit();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      appName: 'Neuer Name',
      description: 'Neue Beschreibung',
    });
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  });
});
