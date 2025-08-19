import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { timer } from 'rxjs';


@Component({
  selector: 'home-page',
  imports: [],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent {
  constructor(private router: Router) {}
  transition = signal(false);

  async transitionToArena() {
     this.transition.set(true);
      // Nueva forma de crear timers
     timer(1500).subscribe(() => {
       this.router.navigate(['/arena']);
     });
  }
}
