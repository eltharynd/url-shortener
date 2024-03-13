import { Component } from '@angular/core'
import axios from 'axios'
import { ClipboardService } from 'ngx-clipboard'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {
  url: string = ''
  slug: string | null = null

  constructor(private clipboard: ClipboardService) {}

  async generate() {
    if (!this.url || this.url.length <= 0) return

    this.slug = (
      await axios.post(`${environment.URL}links`, { url: this.url })
    ).data
    this.copy()
  }

  async copy() {
    if (!this.slug || this.slug.length <= 0) return
    this.clipboard.copyFromContent(this.slug)
  }
}
