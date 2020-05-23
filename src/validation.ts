import * as Joi from '@hapi/joi';
import {Status} from './types';

const userSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .required(),

  username: Joi.string()
    .min(3)
    .required()
});

export const thankYouSchema = Joi.object({
  text: Joi.string()
    .min(3)
    .required(),

  author: userSchema.required(),

  recipient: userSchema.required(),
});

export const thankYouWithIdSchema = thankYouSchema
  .keys({
    id: Joi.string()
      .required(),

    status: Joi.string()
      .valid(...Object.values(Status))
      .required(),
  });