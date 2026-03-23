import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGitRepositoryComponent } from './add-git-repository.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddGitRepositoryComponent', () => {
  let component: AddGitRepositoryComponent;
  let fixture: ComponentFixture<AddGitRepositoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddGitRepositoryComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddGitRepositoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
