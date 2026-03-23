import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteApplicationContextComponent } from './delete-application-context.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('DeleteApplicationContextComponent', () => {
  let component: DeleteApplicationContextComponent;
  let fixture: ComponentFixture<DeleteApplicationContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, DeleteApplicationContextComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteApplicationContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
