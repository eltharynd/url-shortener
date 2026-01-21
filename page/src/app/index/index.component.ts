import { Component, ViewChild } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import axios from 'axios'
import { ClipboardService } from 'ngx-clipboard'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent {
  @ViewChild('uploader') uploader

  busy: boolean = false
  slug: string

  formGroup = new FormGroup({
    url: new FormControl('', [
      Validators.required,
      Validators.pattern(
        /(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/,
      ),
    ]),
  })

  linked: number = 0
  uploaded: number = 0

  constructor(private clipboard: ClipboardService) {
    axios
      .get(`${environment.URL}links`)
      .then(({ data }) => {
        this.linked = data
        console.log(this.linked)
      })
      .catch((e) => console.error(e))

    axios
      .get(`${environment.URL}uploads`)
      .then(({ data }) => {
        this.uploaded = data
        console.log(this.uploaded)
      })
      .catch((e) => console.error(e))
  }

  async shorten(formDirective?) {
    if (!this.formGroup.valid || this.busy) return
    this.busy = true
    this.slug = null
    axios
      .post(`${environment.URL}links`, {
        url: this.formGroup.get('url')?.value,
      })
      .then(({ data }) => {
        this.slug = data
        this.copy()
      })
      .catch((e) => console.error(e))
      .finally(() => {
        this.busy = false
        this.formGroup.reset()
        formDirective.resetForm()
      })
  }

  hovered: boolean = false
  copying: boolean = false
  async copy() {
    if (this.slug?.length > 0) this.clipboard.copyFromContent(this.slug)
  }

  imageSlug: string
  imageError: string
  uploadFile(htmlEvent: any) {
    if (htmlEvent?.target?.files?.length > 0 && !this.busy) {
      this.busy = true

      this.imageSlug = null
      this.imageError = null

      new Promise((resolve, reject) => {
        let file = htmlEvent.target?.files[0] || htmlEvent.files[0]

        if (!file) return

        //in Bytes
        //5MB 5242880
        if (file.size >= 5 * 1024 * 1024) {
          this.imageError = 'File too big (max 5MB)'
          return
        }

        const formData: FormData = new FormData()
        formData.append('file', file, file.name)
        formData.append('filename', file.name)

        let xhr = new XMLHttpRequest()
        xhr.open('POST', `${environment.URL}uploads`)

        xhr.onerror = (err) => {
          reject(err)
        }
        xhr.onloadend = () => {
          resolve(xhr.response)
        }
        xhr.send(formData)
      })
        .then((response) => {
          this.imageSlug = <string>response
        })
        .catch((e) => {
          console.error(e)
        })
        .finally(() => {
          this.busy = false
          this.uploader.nativeElement.value = ''
          if (!/safari/i.test(navigator.userAgent)) {
            this.uploader.nativeElement.type = ''
            this.uploader.nativeElement.type = 'file'
          }
        })
    }
  }

  imageHovered: boolean = false
  imageCopying: boolean = false
  async imageCopy() {
    if (this.imageSlug?.length > 0)
      this.clipboard.copyFromContent(this.imageSlug)
  }
}
