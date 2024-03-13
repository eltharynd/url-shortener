import { IsNotEmpty, IsString, Matches } from 'class-validator'
import mongoose, { Document, Schema, model } from 'mongoose'

export class Link {
  @IsNotEmpty()
  @IsString()
  @Matches(/[a-z0-9]{8}/i)
  slug: string

  @IsNotEmpty()
  @IsString()
  @Matches(/(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/)
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

export interface LinkModel extends Link, Document {
  _id: mongoose.Types.ObjectId
}

export const Links = model<LinkModel>('links', linksSchema)
