const User = require('../model/User');

const savePost = async (req, res) => {
  const { userId } = req.user;
  const { postId } = req.body;

  try {

    await User.findByIdAndUpdate(userId, {
      $addToSet: { savedPosts: postId },
    });

    res.status(200).json({ message: 'Post saved successfully' });
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: 'Failed to save post' });
  }
};

const unsavePost = async (req, res) => {
  const { userId } = req.user;
  const { postId } = req.body;

  try {

    await User.findByIdAndUpdate(userId, {
      $pull: { savedPosts: postId },
    });

    res.status(200).json({ message: 'Post unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving post:', error);
    res.status(500).json({ message: 'Failed to unsave post' });
  }
};

module.exports = { savePost, unsavePost };
