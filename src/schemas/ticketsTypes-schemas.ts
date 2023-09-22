import Joi from 'joi';

const ticketTypeSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  isRemote: Joi.boolean().required(),
  includesHotel: Joi.boolean().required(),
});

export { ticketTypeSchema };
