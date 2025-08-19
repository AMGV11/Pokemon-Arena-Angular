import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page/home-page.component';
import { ArenaComponent } from './pages/arena/arena/arena.component';

export const routes: Routes = [

{
  path: "arena",
  component: ArenaComponent,
},
{
  path: "",
  component: HomePageComponent,
}

];
