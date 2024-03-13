import { Schema, model } from 'mongoose'

export interface ILink {
  slug: string
  url: string
}
const linksSchema: Schema = new Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  url: {
    type: String,
    required: true,
  },
})
export const Links = model<ILink>('links', linksSchema)
