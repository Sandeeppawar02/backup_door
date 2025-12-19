const Joi = require('joi');
const crudSchema = Joi.array().items(Joi.string().valid('READ', 'WRITE', 'UPDATE', 'DELETE'));
const roleSchema = Joi.array().items(Joi.string().valid('READ'));


const RegisterSchema = Joi.object({
  "name": Joi.string().required(),
  "description": Joi.string().allow('').optional(),
  "roles": crudSchema,
  "admin_users": crudSchema,
  "category": crudSchema,
  "subcategory": crudSchema,
  "sales": crudSchema,
  "support": crudSchema,
  "subscription": crudSchema,
  "company":crudSchema,
})
module.exports={RegisterSchema}