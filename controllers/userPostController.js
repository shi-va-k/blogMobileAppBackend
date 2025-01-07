const User = require("../model/User");
const Image = require("../model/UserPost");

exports.uploadImage = async (req, res) => {
  try {
    const image = new Image({
        filename: req.file.filename,
        path: req.file.path,
        contentType: req.file.mimetype, 
        caption: req.body.caption,
        uploadedBy: req.userId,
      });

    await image.save();
    res.status(201).json({ message: "Image uploaded successfully", image });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.find()
      .populate('uploadedBy', 'name') 
      .exec();

    const imagesWithUrls = images.map(image => ({
      ...image.toObject(),
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${image.filename}`,
    }));

    res.status(200).json(imagesWithUrls);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving images", error });
  }
};


