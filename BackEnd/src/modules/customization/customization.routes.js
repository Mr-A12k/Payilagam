const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/authMiddleware');
const catchAsync = require('../../utils/catchAsync');
const { success } = require('../../utils/responseHelper');
const service = require('./customization.service');
router.get('/', catchAsync(async (req, res) => success(res, await service.getSettings())));
router.put('/:key', authenticate, authorize('admin'), catchAsync(async (req, res) => success(res, await service.saveSettings(req.params.key, req.body.value, req.body.revision), 'Settings saved')));
module.exports = router;
