const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;
const downloadsFolderPath = path.join(require('os').homedir(), 'Downloads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded videos in the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the current timestamp as the filename
  }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use((req, res, next, cors) => {
  cors();

  next();
});

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/video.html');

});
app.post('/submit', (req, res) => {
  const requestData = req.body;
  console.log(requestData);

  res.json({ msg: clipCut(requestData) });
});
app.post('/upload', upload.single('video'), (req, res) => {
  res.send('Video uploaded successfully!');
});

function splitFileExt(file) {
  const lastDotIndex = file.lastIndexOf(".");
  return [file.substring(0, lastDotIndex), file.substring(lastDotIndex + 1)];

}

function clipCut(requestData) {
  const folder = requestData.folderName;
  const file = requestData.fileName;
  const times = requestData.times;
  const ip_file = path.join(folder, file);

  const lastDotIndex = file.lastIndexOf(".");
  const fn = file.substring(0, lastDotIndex);
  const ext = file.substring(lastDotIndex + 1);

  //const op_folder = path.join(downloadsFolderPath, "MyVideoCutter", fn + "_" + formatDate());
  const op_folder = path.join(downloadsFolderPath, "MyVideoCutter", fn);
  const command = 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME -c:v copy -c:a copy "OUTPUT_FILE"';
  //const command = 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME  -acodec copy -vcodec copy "OUTPUT_FILE"';
  //const command = 'ffmpeg -y -ss START_TIME -i "INPUT_FILE"  -t DURATION  -c:v copy -c:a copy "OUTPUT_FILE"';

  fs.mkdir(op_folder, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating the folder:', err);
    } else {
      console.log('Folder created successfully:', op_folder);
      let cmd = ""
      for (let time of times) {
        console.log(time[0] + "===" + time[1])
        cmd = command
          .replace("INPUT_FILE", ip_file)
          .replace("START_TIME", time[0])
          .replace("END_TIME", time[1])
          .replace("DURATION", time[2])
          .replace("OUTPUT_FILE", path.join(op_folder, ("[" + time[0] + "-" + time[1] + "]").replaceAll(":", ".") + ".mp4" ));

        callTerminal(cmd);

      }
    }

  });
  return `Files will be saved in \n${op_folder}`;

}
function callTerminal(cmd) {
  console.log("Runnung cmd:> " + cmd);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.log("error in cmd==" + cmd);
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log("cmd executed:> " + cmd);
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}
function formatDate() {
  let date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
