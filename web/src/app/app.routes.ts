import { Routes } from '@angular/router';
import { ArtistsComponent } from './artists/artists.component';
import { TagsComponent } from './tags/tags.component';
import { SandboxComponent } from './sandbox/sandbox.component';
import { TabPage1Component } from './sandbox/views/tab-page1/tab-page1.component';
import { TabPage2Component } from './sandbox/views/tab-page2/tab-page2.component';
import { TabPage3Component } from './sandbox/views/tab-page3/tab-page3.component';
import { ArtistsMasterResolver } from './common/resolvers/artists-master.resolver';
import { ToolsComponent } from './tools/tools.component';
import { ToolsPage1Component } from './tools/views/tools-page1/tools-page1.component';
import { ToolsPage2Component } from './tools/views/tools-page2/tools-page2.component';
import { ToolsPage3Component } from './tools/views/tools-page3/tools-page3.component';
import { ToolsPage4Component } from './tools/views/tools-page4/tools-page4.component';
import { ToolsPage5Component } from './tools/views/tools-page5/tools-page5.component';
import { TabPage4Component } from './sandbox/views/tab-page4/tab-page4.component';

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
    path: 'tools', 
    component: ToolsComponent,
    children: [
      { path: '', redirectTo: 'p1', pathMatch: 'full' },
      { path: 'p1', component: ToolsPage1Component },
      { path: 'p2', component: ToolsPage2Component },
      { path: 'p3', component: ToolsPage3Component },
      { path: 'p4', component: ToolsPage4Component },
      { path: 'p5', component: ToolsPage5Component }
    ]
  },
  { 
    path: 'sandbox', 
    component: SandboxComponent,
    children: [
      { path: '', redirectTo: 'p1', pathMatch: 'full' },
      { path: 'p1', component: TabPage1Component },
      { path: 'p2', component: TabPage2Component },
      { path: 'p3', component: TabPage3Component },
      { path: 'p4', component: TabPage4Component },
    ]
  },
  { path: '', redirectTo: '/artists', pathMatch: 'full' },
];