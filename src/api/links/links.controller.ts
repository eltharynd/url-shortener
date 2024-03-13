import { IsNotEmpty, IsString, Matches } from 'class-validator'
import { Body, JsonController, Post } from 'routing-controllers'
import ShortUniqueId from 'short-unique-id'
import { Links } from './links.model'

const { randomUUID } = new ShortUniqueId({ length: 8 })

export class RequestBody {
  @IsNotEmpty()
  @IsString()
  @Matches(/(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/)
  url: string
}
@JsonController(`/links`)
export class LinksController {
  @Post(`/`)
  async shorten(@Body() body: RequestBody) {
    let link = await Links.create({
      slug: randomUUID(),
      url: body.url,
    })

    await link.save()

    return `https://eltha.wtf/${link.slug}`
  }
}
