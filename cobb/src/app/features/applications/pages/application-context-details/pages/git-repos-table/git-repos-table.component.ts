import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatChip, MatChipAvatar, MatChipSet } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { ScoreFormatterPipe } from '@utils/scoreFormatter-pipe';
import { MatSort } from '@angular/material/sort';
import { GitRepoService } from '@services/git-repo-service';
import { GitRepoDto } from '@models/gitrepo';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-git-repos-table',
  standalone: true,
  imports: [
    MatButton,
    MatCell,
    MatCellDef,
    MatChip,
    MatChipAvatar,
    MatChipSet,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableModule,
    CommonModule,
    ScoreFormatterPipe,
  ],
  templateUrl: './git-repos-table.component.html',
  styleUrl: './git-repos-table.component.scss',
})
export class GitReposTableComponent implements OnInit, AfterViewInit {
  constructor(
    private gitReposService: GitRepoService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
  ) {}

  formatLocalDateTime(localDateTime: string | undefined | null): string {
    if (!localDateTime) {
      return '-';
    }
    const date = new Date(localDateTime);
    return this.datePipe.transform(date, 'dd.MM.yyyy HH:mm:ss') || '-';
  }

  displayedColumns: string[] = [
    'gitRepositoryName',
    'accesstype',
    'createdAt',
    'link',
    'plusIcon',
    'deleteIcon',
  ];

  dataSource = new MatTableDataSource<GitRepoDto>([]);
  contextId: string | null = null;

  @Output() gitReposCountChange = new EventEmitter<number>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.contextId = this.route.snapshot.paramMap.get('contextId');
    this.loadGitRepos(this.contextId!);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadGitRepos(contextId: string) {
    this.gitReposService.getAllReposByContextId(contextId).subscribe({
      next: (rows) => {
        this.dataSource.data = rows;
        this.gitReposCountChange.emit(this.dataSource.data?.length ?? 0);
      },
    });
  }

  startMeasurementWithGitRepo(gitRepoId: string) {
    this.gitReposService.startMeasurementWithGitRepo(gitRepoId).subscribe();
  }

  deleteGitRepo(gitRepoId: string) {
    this.gitReposService.deleteGitRepo(gitRepoId).subscribe({
      next: () => {
        this.loadGitRepos(this.contextId!);
      },
    });
  }
}
