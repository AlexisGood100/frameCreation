const fs = require('fs-extra');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const archiver = require('archiver');

// Ensure 'uploads' directory exists
fs.ensureDirSync('uploads');

// Setup storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store the file in 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({ storage });

const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads')); // Serve uploaded files

// Function to extract frames from the video based on the interval
const extractFrames = async (videoPath, interval) => {
  try {
    // Ensure the video file exists
    if (!await fs.pathExists(videoPath)) {
      throw new Error('Video file does not exist.');
    }

    // Get video file name without extension
    const videoName = path.basename(videoPath, path.extname(videoPath));
    const outputDir = path.join(__dirname, 'public', videoName);

    // Create output directory for extracted frames
    await fs.ensureDir(outputDir);

    // Array to hold relative paths of extracted images
    const imagePaths = [];

    // Use FFmpeg to extract frames based on the interval time
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          `-vf fps=1/${interval}`, // Extract one frame at the given interval
          '-q:v', '2' // Set quality to high
        ])
        .output(path.join(outputDir, '%d.jpg'))
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Populate imagePaths array with relative paths of the extracted frames
    const files = await fs.readdir(outputDir);
    files.sort().forEach(file => {
      imagePaths.push(path.join(videoName, file));
    });

    return { imagePaths, outputDir };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
};

/// Function to create a zip file of extracted frames
const createZip = async (outputDir, videoName) => {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(__dirname, 'public', `${videoName}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Set compression level to maximum
    });

    output.on('close', () => {
      console.log(`Zip file created at: ${zipPath}`);  // Add logging here
      resolve(zipPath); // Return the path to the zip file
    });

    archive.on('error', (err) => {
      console.error('Error creating zip file:', err);
      reject(err);
    });

    archive.pipe(output);

    // Append each image file to the zip
    fs.readdir(outputDir, (err, files) => {
      if (err) {
        console.error('Error reading directory:', err);
        reject(err);
      }

      files.forEach(file => {
        archive.file(path.join(outputDir, file), { name: file });
      });

      archive.finalize();
    });
  });
};

// Route to display the form to upload an MP4
app.get('/', (req, res) => {
  res.render('index');
});

// Route to handle the form submission and process the video
app.post('/submit', upload.single('mp4'), async (req, res) => {
  try {
    const { interval } = req.body;
    const videoPath = req.file.path;

    // Process the video and extract frames
    const { imagePaths, outputDir } = await extractFrames(videoPath, interval);

    // Create the zip file
    const zipPath = await createZip(outputDir, path.basename(videoPath, path.extname(videoPath)));

    // Get the zip file name (e.g., videoName.zip)
    const zipFileName = path.basename(zipPath);

    // Serve the correct path for the zip file to the frontend
    res.render('download', { zipPath: `/${zipFileName}` });  // Use `/` to ensure it's from the root
  } catch (error) {
    res.status(500).send('Error processing video');
  }
});



app.listen(3000, () => {
  console.log('Server has started');
});
