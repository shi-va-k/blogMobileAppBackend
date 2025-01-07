const express = require('express');
const { savePost, unsavePost } = require('../controllers/savedController');
const authenticateUser = require('../middlewares/authenaticateUser'); 

const router = express.Router();

router.post('/save-post', authenticateUser, savePost);

router.delete('/save-post', authenticateUser, unsavePost);

module.exports = router;
