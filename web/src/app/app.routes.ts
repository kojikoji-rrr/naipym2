import { Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { TagsComponent } from './tags/tags.component';
import { SandboxComponent } from './sandbox/sandbox.component';
import { TabPage1Component } from './sandbox/views/tab-page1/tab-page1.component';
import { TabPage2Component } from './sandbox/views/tab-page2/tab-page2.component';
import { TabPage3Component } from './sandbox/views/tab-page3/tab-page3.component';
import { ArtistsMasterResolver } from './common/resolvers/artists-master.resolver';

export const routes: Routes = [
  {
    path: 'artists',
    component: ArtistsComponent,
    resolve: {
      master: ArtistsMasterResolver
    }
  },
  {
    path: 'tags',
    component: TagsComponent
  },
  { 
    path: 'sandbox', 
    component: SandboxComponent,
    children: [
      { path: '', redirectTo: 'p1', pathMatch: 'full' },
      { path: 'p1', component: TabPage1Component },
      { path: 'p2', component: TabPage2Component },
      { path: 'p3', component: TabPage3Component },
    ]
  },
  { path: '', redirectTo: '/artists', pathMatch: 'full' },
];