import * as Joi from '@hapi/joi';

const userSchema = Joi.object({
  name: Joi.string()
    .min(3),

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
