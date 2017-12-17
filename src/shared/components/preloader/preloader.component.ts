import {Component} from "@angular/core";
import css from "./preloader.component.css!text";


@Component({
  selector : 'preloader',
  template : `
      <div class="loading"></div>
  `,
  styles : [css]
})
export class PreloaderComponent {}