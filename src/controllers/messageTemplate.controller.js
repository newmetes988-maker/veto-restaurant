const messageTemplateService = require('../services/messageTemplate.service');
const catchAsync = require('../utils/catchAsync');

/**
 * GET /api/v1/admin/templates
 * List all message templates.
 */
const getAllTemplates = catchAsync(async (req, res) => {
  const templates = await messageTemplateService.getAllTemplates();
  res.status(200).json({
    status: 'success',
    results: templates.length,
    data: { templates },
  });
});

/**
 * GET /api/v1/admin/templates/:id
 * Get a single template by ID.
 */
const getTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const template = await messageTemplateService.getTemplateById(id);
  res.status(200).json({
    status: 'success',
    data: { template },
  });
});

/**
 * POST /api/v1/admin/templates
 * Create a new message template.
 */
const createTemplate = catchAsync(async (req, res) => {
  const template = await messageTemplateService.createTemplate(req.body);
  res.status(201).json({
    status: 'success',
    message: 'Template created successfully',
    data: { template },
  });
});

/**
 * PATCH /api/v1/admin/templates/:id
 * Update an existing message template.
 */
const updateTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const template = await messageTemplateService.updateTemplate(id, req.body);
  res.status(200).json({
    status: 'success',
    message: 'Template updated successfully',
    data: { template },
  });
});

/**
 * DELETE /api/v1/admin/templates/:id
 * Delete a message template.
 */
const deleteTemplate = catchAsync(async (req, res) => {
  const { id } = req.params;
  await messageTemplateService.deleteTemplate(id);
  res.status(204).json({
    status: 'success',
    message: 'Template deleted successfully',
  });
});

/**
 * POST /api/v1/admin/templates/preview
 * Preview a rendered template with variables.
 */
const previewTemplate = catchAsync(async (req, res) => {
  const { body, variables } = req.body;
  const rendered = messageTemplateService.renderTemplate(body, variables || {});
  res.status(200).json({
    status: 'success',
    data: { rendered },
  });
});

module.exports = {
  getAllTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
};
