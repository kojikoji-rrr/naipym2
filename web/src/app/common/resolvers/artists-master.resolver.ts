import { ResolveFn } from '@angular/router';
import { ApiService } from '../services/api.service';
import { inject } from '@angular/core';
import { Observable, from } from 'rxjs';

export const ArtistsMasterResolver: ResolveFn<any> = (): Observable<any> => {
  const apiService = inject(ApiService);
  return from(apiService.getArtistMaster());
}
