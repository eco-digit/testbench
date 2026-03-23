import { Component } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { BreadcrumbData } from '@models/misc';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterLink, MatIcon, MatButton],
})
export class BreadcrumbComponent {
  breadcrumbs: BreadcrumbData[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.breadcrumbs = this.buildBreadcrumb(this.activatedRoute.root);
      }
    });
  }

  buildBreadcrumb(route: ActivatedRoute, url: string = ''): BreadcrumbData[] {
    const breadcrumbs: BreadcrumbData[] = [];

    while (route) {
      const routeConfig = route.snapshot.routeConfig;
      const path = routeConfig?.path || '';

      let fullPath = url;

      if (path) {
        const segments = path.split('/');
        const resolvedSegments = segments.map((segment) => {
          if (segment.startsWith(':')) {
            const paramName = segment.slice(1);
            return route.snapshot.params[paramName];
          }
          return segment;
        });
        fullPath += '/' + resolvedSegments.join('/');
      }

      const breadcrumbData = route.snapshot.data['breadcrumb'];
      if (breadcrumbData && breadcrumbData.label) {
        breadcrumbs.push({
          label: breadcrumbData.label,
          link: fullPath.replace(/\/+/g, '/'),
        });
      }

      route = route.firstChild!;
      url = fullPath;
    }

    return breadcrumbs;
  }
}
