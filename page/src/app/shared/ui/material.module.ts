import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MAT_DATE_LOCALE } from '@angular/material/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatTooltipModule } from '@angular/material/tooltip'

const declarations: any[] = []

const modules = [
  FormsModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  ReactiveFormsModule,
  MatTooltipModule,
]

@NgModule({
  declarations: [...declarations],
  imports: [...modules],
  exports: [...declarations, ...modules],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'it-CH' }],
})
export class MaterialModule {}
