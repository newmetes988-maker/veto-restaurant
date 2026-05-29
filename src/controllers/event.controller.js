const eventService = require('../services/event.service');
const catchAsync = require('../utils/catchAsync');
const logger = require('../utils/logger');

const getAllEvents = catchAsync(async (req, res) => {
  const events = await eventService.getAllEvents(req.query);
  res.status(200).json({ status: 'success', results: events.length, data: { events } });
});

const getEvent = catchAsync(async (req, res) => {
  const event = await eventService.getEventById(req.params.id);
  res.status(200).json({ status: 'success', data: { event } });
});

const createEvent = catchAsync(async (req, res) => {
  logger.info('Creating event', { body: req.body });
  const event = await eventService.createEvent(req.body);
  res.status(201).json({ status: 'success', message: 'Event created', data: { event } });
});

const updateEvent = catchAsync(async (req, res) => {
  logger.info('Updating event', { id: req.params.id, body: req.body });
  const event = await eventService.updateEvent(req.params.id, req.body);
  res.status(200).json({ status: 'success', message: 'Event updated', data: { event } });
});

const deleteEvent = catchAsync(async (req, res) => {
  await eventService.deleteEvent(req.params.id);
  res.status(204).json({ status: 'success', message: 'Event deleted' });
});

module.exports = { getAllEvents, getEvent, createEvent, updateEvent, deleteEvent };
