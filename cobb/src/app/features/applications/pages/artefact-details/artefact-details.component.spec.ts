import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtefactDetailsComponent } from './artefact-details.component';
import { DatePipe } from '@angular/common';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('ArtefactDetailsComponent', () => {
  let component: ArtefactDetailsComponent;
  let fixture: ComponentFixture<ArtefactDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ArtefactDetailsComponent,
        HttpClientModule,
        BrowserAnimationsModule,
      ],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ artefactId: '123' }), // Mock params
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'artefactId' ? '123' : null),
              },
            }, // Mock snapshot
          },
        },
        DatePipe,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArtefactDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
