import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteApplicationComponent } from './delete-application.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DeleteApplicationComponent', () => {
  let component: DeleteApplicationComponent;
  let fixture: ComponentFixture<DeleteApplicationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteApplicationComponent, HttpClientTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
