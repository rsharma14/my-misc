const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

const app = express();
const port = 3000;
const downloadsFolderPath = path.join(require('os').homedir(), 'Downloads');
const historyFile = 'history.txt';

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
const ext = ".mp4";
function clipCut(requestData) {
  const folder = requestData.folderName;
  const file = requestData.fileName;
  const times = requestData.times;

  const lastDotIndex = file.lastIndexOf(".");
  const fn = file.substring(0, lastDotIndex);
  //const ext = ".mp4";// file.substring(lastDotIndex + 1);

  //const op_folder = path.join(downloadsFolderPath, "MyVideoCutter", fn + "_" + formatDate());
  const op_folder = path.join(downloadsFolderPath, "MyVideoCutter", fn);
  const ip_file = path.join(folder, file);
  let op_file = null;

  let command = "";
  //command= 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME -c:v copy -c:a copy "OUTPUT_FILE"';
  //command = 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME  -acodec copy -vcodec copy "OUTPUT_FILE"';
  //command = 'ffmpeg -y -ss START_TIME -i "INPUT_FILE"  -t DURATION  -c:v copy -c:a copy "OUTPUT_FILE"';
  //command = 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME -c:v copy -c:a copy "OUTPUT_FILE"';
  //---above has frame loss---
  command = 'ffmpeg -y -i "INPUT_FILE" -ss START_TIME -to END_TIME -map 0 -c:v libx264 -c:a copy  "OUTPUT_FILE"';


  fs.mkdir(op_folder, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating the folder:', err);
    } else {
      console.log('Folder created successfully:', op_folder);
      addInHistory("\n=====" + new Date() + "=====\n"+JSON.stringify(requestData.times)+"\n");
      callRecursively(ip_file, op_folder, times, 0);
      for (let time of times) {
        //console.log(time[0] + "===" + time[1])


      }
    }

  });
  return `Files will be saved in \n${op_folder}`;

}
function callRecursively(ip_file, op_folder, times, idx) {
  if (idx == times.length) {
    console.log(`================ALL ${idx} VIDEOS CONVERTED================`);
    return;
  }

  console.log(`times[${idx}]=${times[idx]}`);

  let time = times[idx];
  let op_file = path.join(op_folder, ("[" + time[0] + "-" + time[1] + "]").replaceAll(":", ".") + ext);
  callFFMPG(ip_file, op_file, time[0], time[1], time[2], () => {
    callRecursively(ip_file, op_folder, times, ++idx);
    console.log("idx=" + idx);
  });
}
function callFFMPG(ip_file, op_file, ss, to, t, callback) {

  const ffmpeg = spawn('ffmpeg', [
    '-n', '-i', ip_file, '-ss', ss, '-to', to,//'-t',t,
    '-c:v', 'libx264', '-c:a', 'copy', op_file
  ]);
  console.log(`Runnung cmd= ${ffmpeg.spawnargs.toString().replaceAll(",", " ")}`);
  addInHistory(ip_file + ":[" + ss + " - " + to + "]" + ":STARTED("+new Date()+").....[" + ffmpeg.spawnargs.toString().replaceAll(",", " ") + "]\n");
  ffmpeg.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
  });

  ffmpeg.stderr.on("data", data => {
    console.log(`stderr: ${data}`);
  });

  ffmpeg.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });

  ffmpeg.on("close", code => {
    console.log(`child process exited with code ${code}`);
    console.log(`cmd executed= ${ffmpeg.spawnargs.toString().replaceAll(",", " ")}`);
    if (code === 0)
      addInHistory(ip_file + ":[" + ss + " - " + to + "]" + ":OK("+new Date()+")\n");
    callback();
  });

  /*
 let process=exec("start cmd.exe /K "+cmd, (error, stdout, stderr) => {
   if (error) {
     console.log("error in cmd==" + cmd);
     console.error(`Error: ${error.message}`);
     return;
   }
   console.log("cmd executed:> " + cmd);
   console.log(`stdout: ${stdout}`);
   console.error(`stderr: ${stderr}`);
 });
 process.on('SIGINT', function() { 
   console.log(11)
  });
*/

}


function addInHistory(content) {
  console.log(content);
  fs.appendFileSync(historyFile, content);
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
  exec(`start http://localhost:${port}`);
});
