import { Component, OnInit } from '@angular/core'
import { ClipboardService } from 'ngx-clipboard'
import axios from 'axios'

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
      await axios.post('https://eltha.wtf/create', { url: this.url })
    ).data
    this.copy()
  }

  async copy() {
    if (!this.slug || this.slug.length <= 0) return
    this.clipboard.copyFromContent(this.slug)
  }
}
