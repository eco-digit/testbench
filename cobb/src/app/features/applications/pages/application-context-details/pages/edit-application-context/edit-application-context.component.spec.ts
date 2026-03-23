import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApplicationContextComponent } from './edit-application-context.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EditApplicationContextComponent', () => {
  let component: EditApplicationContextComponent;
  let fixture: ComponentFixture<EditApplicationContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        EditApplicationContextComponent,
        HttpClientTestingModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditApplicationContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
