const settingService = require('../services/setting.service');
const catchAsync = require('../utils/catchAsync');

const getPublicSettings = catchAsync(async (req, res) => {
  const settings = await settingService.getOrCreateSettings();
  res.status(200).json({
    status: 'success',
    data: {
      socialLinks: settings.social_links || {},
      contactPhones: settings.contact_phones || [],
      contactEmail: settings.contact_email || '',
      address: settings.address || '',
    },
  });
});

const getAdminSettings = catchAsync(async (req, res) => {
  const settings = await settingService.getOrCreateSettings();
  res.status(200).json({
    status: 'success',
    data: {
      id: settings.id,
      socialLinks: settings.social_links || {},
      contactPhones: settings.contact_phones || [],
      contactEmail: settings.contact_email || '',
      address: settings.address || '',
      updatedAt: settings.updated_at,
    },
  });
});

const updateSettings = catchAsync(async (req, res) => {
  const { socialLinks, contactPhones, contactEmail, address } = req.body;
  const settings = await settingService.updateSettings({
    socialLinks,
    contactPhones,
    contactEmail,
    address,
  });
  res.status(200).json({
    status: 'success',
    message: 'Settings updated',
    data: {
      socialLinks: settings.social_links,
      contactPhones: settings.contact_phones,
      contactEmail: settings.contact_email,
      address: settings.address,
    },
  });
});

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
