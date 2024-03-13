import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { FormControlErrorsPipe } from './pipes/formcontrol-error.pipe'
import { MaterialModule } from './ui/material.module'

const imports: any[] = [
  CommonModule,
  HttpClientModule,
  MaterialModule,
  RouterModule,
]

const declarations: any[] = []

const providers: any[] = [FormControlErrorsPipe]

@NgModule({
  imports: [...imports],
  declarations: [...declarations, ...providers],
  exports: [...imports, ...declarations, ...providers],
  providers: [...providers],
})
export class SharedModule {}
