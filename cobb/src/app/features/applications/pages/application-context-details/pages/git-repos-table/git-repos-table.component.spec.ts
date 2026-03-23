import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GitReposTableComponent } from './git-repos-table.component';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GitReposTableComponent', () => {
  let component: GitReposTableComponent;
  let fixture: ComponentFixture<GitReposTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        BrowserAnimationsModule,
        GitReposTableComponent, // Import the standalone component here
      ],
      providers: [
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue('123'),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GitReposTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
