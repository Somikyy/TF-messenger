import Joi from 'joi';

/**
 * Middleware для валидации данных запроса
 * @param {Object} schema - Joi schema для валидации
 * @param {string} source - Источник данных ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Заменяем данные на валидированные
    req[source] = value;
    next();
  };
};

// Схемы валидации для разных endpoints

export const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  displayName: Joi.string().min(1).max(100).optional(),
  avatar: Joi.string().uri().optional(),
});

export const createChatSchema = Joi.object({
  type: Joi.string().valid('direct', 'group').required(),
  name: Joi.string().min(1).max(100).when('type', {
    is: 'group',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  participantIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

export const createMessageSchema = Joi.object({
  content: Joi.string().min(1).max(5000).required(),
  type: Joi.string().valid('text', 'image', 'video', 'audio', 'file').optional(),
  mediaUrl: Joi.string().uri().optional(),
});

export const searchUsersSchema = Joi.object({
  search: Joi.string().min(1).max(100).optional(),
});

export const getMessagesSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

export const addParticipantsSchema = Joi.object({
  participantIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
});

export default {
  validate,
  registerSchema,
  loginSchema,
  updateUserSchema,
  createChatSchema,
  createMessageSchema,
  searchUsersSchema,
  getMessagesSchema,
  addParticipantsSchema,
};

