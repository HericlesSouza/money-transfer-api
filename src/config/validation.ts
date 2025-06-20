import * as Joi from 'joi';

export const validationSchema = Joi.object({
  API_PORT: Joi.number().default(3000),
  DATABASE_PATH: Joi.string().default('./database/db.sqlite'),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('3600s'),
});
