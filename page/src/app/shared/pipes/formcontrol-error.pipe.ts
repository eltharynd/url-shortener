import { Pipe, PipeTransform } from '@angular/core'
import { AbstractControl, FormControl } from '@angular/forms'

@Pipe({
  name: 'formControlError',
  pure: false,
})
export class FormControlErrorsPipe implements PipeTransform {
  transform(formControl: FormControl | AbstractControl) {
    if (formControl.status === 'VALID') return null

    if (formControl.errors['required']) {
      return 'Required'
    } else if (formControl.errors['pattern']) {
      return `This isn't a valid url`
    } else {
      return 'Invalid field'
    }
  }
}
