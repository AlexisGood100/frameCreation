This application processes mp4s into a specific amount of pngs depending on the input in the interval input.
If you put 1, it will take an image every second of the video, resulting in a 44 second video outputting 44 pngs.
This project is full-stack using nodeJS to serve ejs pages as the view. 
To use this you need to have java binaries and ffmpeg installed, as well as added as environment variables.

This project uses the file system with ffmpeg, express, bodyParser, multer, and archiver. Feel free to reuse or modify the code. 
This project is also containerized using Docker. I was going to deploy it using Heroku but it says my card doesn't support the requirements of signing up,
so I will need to explore that after getting a throwaway card or something.
