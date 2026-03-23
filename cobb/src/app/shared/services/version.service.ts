import { Injectable } from '@angular/core';

/**
 * This service is created to control the visibility of UI elements
 * based on the current basis version.
 *
 * It is a temporary solution and can be deleted once version-based
 * conditions are no longer needed.
 */
@Injectable({
  providedIn: 'root',
})
export class VersionService {
  isBasisVersion = true;
}
