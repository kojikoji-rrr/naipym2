import { Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { TagsComponent } from './tags/tags.component';

export const routes: Routes = [
  { path: 'artists', component: ArtistsComponent },
  { path: 'tags',    component: TagsComponent },
];