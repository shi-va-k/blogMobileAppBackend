const Comment = require('../model/CommentSection');

exports.addComment = async (req, res) => {
  try {
    const { postId, text } = req.body;
    const userId = req.user._id; 
    const username = req.user.name; 

    if (!postId || !text) {
      return res.status(400).json({ message: 'Post ID and comment text are required.' });
    }

    const newComment = new Comment({
      postId,
      userId,
      username,
      text,
    });

    await newComment.save();
    res.status(201).json({ message: 'Comment added successfully.', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add comment.', error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: 'Post ID is required.' });
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch comments.', error: error.message });
  }
};
