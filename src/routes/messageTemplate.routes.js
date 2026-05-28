const express = require('express');
const { z } = require('zod');
const router = express.Router();

const controller = require('../controllers/messageTemplate.controller');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const createTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(50),
    type: z.enum(['whatsapp', 'sms', 'email']).optional(),
    subject: z.string().max(255).optional(),
    body: z.string().min(1, 'Body is required'),
    variables: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
  }),
});

const updateTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    type: z.enum(['whatsapp', 'sms', 'email']).optional(),
    subject: z.string().max(255).optional(),
    body: z.string().min(1).optional(),
    variables: z.array(z.string()).optional(),
    is_active: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  }),
});

const previewSchema = z.object({
  body: z.object({
    body: z.string().min(1, 'Template body is required'),
    variables: z.record(z.string()).optional(),
  }),
});

router.get('/', authenticate, controller.getAllTemplates);
router.get('/:id', authenticate, controller.getTemplate);
router.post('/', authenticate, validate(createTemplateSchema), controller.createTemplate);
router.patch('/:id', authenticate, validate(updateTemplateSchema), controller.updateTemplate);
router.delete('/:id', authenticate, controller.deleteTemplate);
router.post('/preview', authenticate, validate(previewSchema), controller.previewTemplate);

module.exports = router;
