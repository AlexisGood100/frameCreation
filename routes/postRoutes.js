const app = require('express');
const router = app.Router();

const {postMp4ToSubmit} = require('../controllers/postController');

router.get('/', postMp4ToSubmit);


module.exports = router;