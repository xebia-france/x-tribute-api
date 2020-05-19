import * as Joi from '@hapi/joi';

const userSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .required(),

  email: Joi.string()
    .email()
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

    status: Joi.number()
      .positive()
      .max(2)
      .required(),
  });