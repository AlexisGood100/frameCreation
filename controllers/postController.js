const multer = require('multer');


const postMp4ToSubmit = async (req, res) =>{
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
}

module.exports = {postMp4ToSubmit};