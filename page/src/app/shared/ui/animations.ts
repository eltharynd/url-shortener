import { animate, style, transition, trigger } from '@angular/animations'

export const POPIN = trigger('popIn', [
  transition('void => *', [
    style({ opacity: 0, transform: 'translateX(-.5rem) translateY(1rem)' }),
    animate('1000ms ease'),
  ]),
])
