const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/commentMiddle'); 

router.post('/comments', authMiddleware, commentController.addComment);

router.get('/comments/:postId', commentController.getComments);

module.exports = router;
