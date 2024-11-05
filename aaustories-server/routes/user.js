// routes/userRoutes.js
const express = require('express');
const User = require('../model/User');
const cloudinary = require('../config/cloudconfig');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const router = express.Router();
const multer = require('multer');
const Confession = require('../model/Comfession')
const Topic = require('../model/Topic');
const Meme = require('../model/Meme')
const Blog = require('../model/Blog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AdminUser = require('../model/AdminUser');
const  generateRandomSecret = require('../config/generateSecretKey')

const secretKey = generateRandomSecret();
console.log('Generated Secret Key:', secretKey); 


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'Blog Image';
    let format = file.mimetype.startsWith('video') ? 'mp4' : 'jpg'; // Set format based on file type

    return {
      folder: folder,
      format: format,
      public_id: Date.now().toString(),
      resource_type: file.mimetype.startsWith('video') ? 'video' : 'image', // Set resource_type accordingly
    };
  },
})
  
 
const upload = multer({ storage: storage });


router.post('/search', async (req, res) => {
    const { gender, location } = req.body;
  
    if (!gender || !location) {
      return res.status(400).json({ message: 'Gender and location are required' });
    }

    try {
      const users = await User.find({
        gender: { $regex: new RegExp(`^${gender}$`, 'i') },  // Case-insensitive match
        location: { $regex: new RegExp(`^${location}$`, 'i') }  // Case-insensitive match
      });
  
      if (users.length > 0) {
        res.json(users);
        
      } else {
        res.status(404).json({ message: 'No users found' });
      }
    } catch (err) {
      console.error('Error searching for users:', err);
      res.status(500).json({ message: 'Server error' });
    }
   
  });
  
  


// Example of creating a new user
router.post('/users', upload.single('image'), async (req, res) => {
    const { name, location, gender, desc, contact,facebookLink, whatsappNumber, instagramLink } = req.body;
    const imageUrl = req.file.path;
    try {
      const newUser = new User({
        name,
        location,
        gender,
        desc,
        contact,
        image: imageUrl,
        facebookLink,
        whatsappNumber,
        instagramLink
      });
  
      await newUser.save();
      res.status(201).json(newUser);
      console.log('user created')
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

  router.post('/submit-comfession', async (req, res) => {
    try {
      const { text } = req.body;
      const newConfession = new Confession({ text });
      await newConfession.save();
      res.status(201).json(newConfession);
    } catch (error) {
      res.status(400).json({ message: 'Error submitting confession' });
    }
  });
  
  // Get all confessions
  router.post('/get-random-confessions', async (req, res) => {
    const { exclude } = req.body; // List of read confession IDs to exclude
  
    try {
      // Fetch random confessions excluding the ones read by the user
      const confessions = await Confession.find({ _id: { $nin: exclude } })
        .sort({ createdAt: -1 }) // Optional: Order by creation date
        .limit(10); // Adjust the limit as needed
  
      res.status(200).json(confessions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch confessions' });
    }
  });
  
  router.get('/confession/:confessionId', async (req, res) => {
    try {
        const confessionId = req.params.confessionId ; 
        const confession = await Confession.findById({ _id: confessionId });
        if (!confession) {
            return res.status(404).json({ message: 'Confession not found' });
        }
        res.status(200).json(confession);
    } catch (error) {
        console.error('Error fetching confession:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

  // Add a comment to a confession
  router.post('/confessions/:id/confession-comment', async (req, res) => {
    try {
        const { tex } = req.body;
        const confession = await Confession.findById(req.params.id);
        if (!confession) {
            return res.status(404).json({ message: 'Confession not found' });
        }
        confession.comments.push({ tex });
        await confession.save();
        res.status(201).json(confession);
    } catch (error) {
        res.status(400).json({ message: 'Error adding comment' });
    }
});

router.post('/topics', async (req, res) => {
  try {
    const { content } = req.body;

    await Topic.deleteMany({});

    // Create and save the new topic
    const newTopic = new Topic({ content });
    await newTopic.save();

    res.status(201).json(newTopic);
  } catch (error) {
    res.status(400).json({ message: 'Error submitting topic' });
  }
});


router.get('/get-topics', async (req, res) => {
  try {
    const topics = await Topic.find();
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching topics' });
  }
});
router.get('/topics/:id', async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a topic
router.post('/topics/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    const topic = await Topic.findById(req.params.id);
    topic.comments.push({ text });
    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment' });
  }
});


router.get('/meme', async (req, res) => {
  const memes = await Meme.aggregate([{ $sample: { size: 10 } }]); // Get random memes
  res.json(memes);
});

// Upload a new meme
router.post('/upload-meme', upload.single('file'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
      }

      // Create a new Meme instance
      const meme = new Meme({
          type: req.file.mimetype.startsWith('video') ? 'video' : 'image',
          url: req.file.path, // Use the Cloudinary URL returned in req.file.path
          caption: req.body.caption,
      });

      // Save to the database
      await meme.save();

      // Send a success response
      res.status(201).json(meme);
  } catch (error) {
      console.error('Upload error:', JSON.stringify(error, null, 2)); // Log the error as a JSON string

      // Send a detailed error response
      res.status(500).json({
          error: error.message || 'An unknown error occurred while uploading the meme',
          details: error, // Include additional error details for troubleshooting
      });
  }
});


// Like a meme
router.post('/meme/:id/like', async (req, res) => {
  const meme = await Meme.findById(req.params.id);
  meme.likes += 1;
  await meme.save();
  res.json(meme);
});

// Comment on a meme
router.post('/meme/:id/comment', async (req, res) => {
  const meme = await Meme.findById(req.params.id);
  meme.comments.push(req.body);
  await meme.save();
  res.json(meme);
});




//Blog endpoint

router.post('/create-blog',  upload.single('image'),async (req, res) => {
  try {
      const { title, content, author, categories } = req.body;
      const imageUrl = req.file.path;

      const newBlog = new Blog({
          title,
          content,
          author,
          categories,
          blogImage:imageUrl,
          
      });

      const savedBlog = await newBlog.save();
      res.status(201).json(savedBlog);
  } catch (error) {
      res.status(500).json({ message: 'Error creating blog post', error });
  }
});

// Get all blog posts
router.get('/get-all-blog', async (req, res) => {
  try {
      const blogs = await Blog.find();
      res.json(blogs);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching blogs', error });
  }
});

// Update a blog post
router.put('/update-blog/:id', async (req, res) => {
  try {
      const { title, description, content, author, categories, blogImage } = req.body;
      const updatedBlog = await Blog.findByIdAndUpdate(
          req.params.id,
          { title, description, content, author, categories, blogImage },
          { new: true }
      );

      if (!updatedBlog) {
          return res.status(404).json({ message: 'Blog post not found' });
      }

      res.json(updatedBlog);
  } catch (error) {
      res.status(500).json({ message: 'Error updating blog post', error });
  }
});

// Example Express route
router.get('/get-latest-blog', async (req, res) => {
  try {
      const latestBlog = await Blog.findOne().sort({ createdAt: -1 }); // Assuming 'createdAt' is your date field
      res.json(latestBlog);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching latest blog' });
  }
});

// Delete a blog post
router.delete('/delete-blog/:id', async (req, res) => {
  try {
      const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

      if (!deletedBlog) {
          return res.status(404).json({ message: 'Blog post not found' });
      }

      res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting blog post', error });
  }
});

//Admin Register

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Check if the user already exists
    const existingUser = await AdminUser.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new AdminUser({ username, password: hashedPassword });
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later.' });
  }
});

// Login Route
router.post('/admin-login', async (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  const existingUser = await AdminUser.findOne({ username });
  if (!existingUser) return res.status(401).json({ error: 'Invalid credentials' });

  // Check password
  const validPassword = await bcrypt.compare(password, existingUser.password);
  if (!validPassword) return res.status(401).json({ error: 'Invalid credentials' });

  // Generate a token
  const token = jwt.sign({ username: existingUser.username }, secretKey, { expiresIn: '1h' }); // Use the generated secret key
  res.json({ token });
});



  // Backend: Schedule job to delete confessions older than 24 hours
const cron = require('node-cron');

cron.schedule('0 0 * * *', async () => {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - 24);

  try {
    await Confession.deleteMany({ createdAt: { $lt: cutoffDate } });
    console.log('Deleted old confessions');
  } catch (error) {
    console.error('Error deleting old confessions:', error);
  }
});

module.exports = router;


