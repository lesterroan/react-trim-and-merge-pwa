import logo from './logo.svg';
import { useState, useEffect } from 'react'
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
//createFFmeg function gives as a starting point for working with this library

const ffmpeg = createFFmpeg({ log: true });

//the actual webassembly binary has to be loaded asynchronously to not block the web app at start


function App() {

  const [ready, setReady] = useState(false);
  const [video1, setVideo1] = useState();
  const [video2, setVideo2] = useState();
  const [video3, setVideo3] = useState();


  const [vid1Start, setVid1Start] = useState({ "h": "01", "m": "30", "s": "20" });
  const [vid2Start, setVid2Start] = useState(0);
  const [vid3Start, setVid3Start] = useState(0);

  const [gif, setGif] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }

  // const trimVideo = (start, end, videoNum) => {
  //   //Reflect on the loader "Trimming ____.mp4  "
  //   await ffmpeg.run('-i', '-ss', start, '-t', end,)
  // }

  const convertToGif = async () => {
    console.log(vid1Start);


    // Write the file to memory 
    //Web assembly is managing its own memory file system, in order to run ffmpeg on the file you need to make it known to the wasm file system
    ffmpeg.FS('writeFile', 'vid1.mp4', await fetchFile(video1)) //take video and save it as test.mp4
    ffmpeg.FS('writeFile', 'vid2.mp4', await fetchFile(video2)) //take video and save it as test.mp4
    ffmpeg.FS('writeFile', 'vid3.mp4', await fetchFile(video3)) //take video and save it as test.mp4

    // Run ffmpeg command
    // -i flag is for input, -t is the length we want the video to be
    // -ss to offset starting second, -f to encode
    //await ffmpeg.run('-i', 'vid2.mp4', '-t', '2.5', '-ss', '2.0', '-f', 'gif', 'out.gif')

    // await ffmpeg.run("-i", 'vid1.mp4', "-i", 'vid2.mp4', "-i", 'vid3.mp4',
    //   "-filter_complex", "[0:v:0][0:a:0][1:v:0][1:a:0][2:v:0][2:a:0]concat=n=3:v=1:a=1[outv][outa]", "-map", "[outv]", "-map", "[outa]", '-s', '1920x1080', "output.mp4")



    await ffmpeg.run("-i", 'vid1.mp4', "-i", 'vid2.mp4',
      "-filter_complex", "[0:v:0]trim=start=00:00:00:end=00:00:03,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v0],[0:a:0]atrim=start=00:00:00:end=00:00:10,asetpts=PTS-STARTPTS[a0],[1:v:0]trim=start=00:00:00:end=00:00:03,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v1],[1:a:0]atrim=start=00:00:00:end=00:00:03,asetpts=PTS-STARTPTS[a1],[v0][a0][v1][a1]concat=n=2:v=1:a=1[outv][outa]", "-vsync", "2", "-map", "[outv]", "-map", "[outa]", '-s', '1920x1080', "output.mp4")

    //read result 
    const data = ffmpeg.FS('readFile', 'output.mp4');

    //create a url to view it in the browser, blob just means raw file in thiss case binary 
    // pass the MIME type???
    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setGif(url);
  }

  const loadVideo = file => new Promise((resolve, reject) => {
    try {
      let video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = function () {
        resolve(this)
      }

      video.onerror = function () {
        reject("Invalid video. Please select a video file.")
      }

      video.src = window.URL.createObjectURL(file)
    } catch (e) {
      reject(e)
    }
  })

  const handleVideoInput = async (fileInput, vidNum) => {

    if (vidNum == "vid1") {

      setVideo1(fileInput.target.files?.item(0));
      const file = await loadVideo(fileInput.currentTarget.files[0]);
      const duration = new Date(null);
      duration.setSeconds(file.duration);
      const time = duration.toISOString().substr(11, 8);
      console.log(time);
      const hour = time.substr(0, 2)
      const min = time.substr(3, 2)
      const sec = time.substr(6, 2)

      setVid1Start({ "dfdf": 524154545 })

    } else if (vidNum === "vid2") {
      console.log("vid2");
      setVideo2(fileInput.target.files?.item(0));
    } else {
      console.log("NOT vid 1");
    }


  }

  useEffect(() => {
    load();
  }, [])

  //logical && operator to show the video elem only when video is defined
  return ready ? (
    <div className="App">

      { video1 && <video
        controls
        width="320" height="240"
        src={URL.createObjectURL(video1)}>
      </video>}

      <TimeFormat videoLength={vid1Start} />
      <hr />

      { video2 && <video
        controls
        width="320" height="240"
        src={URL.createObjectURL(video2)}>
      </video>}

      <hr />
      { video3 && <video
        controls
        width="320" height="240"
        src={URL.createObjectURL(video3)}>
      </video>}

      <input type="file" accept="video/*" onChange={(inputVideo) => handleVideoInput(inputVideo, "vid1")} />
      <input type="file" accept="video/*" onChange={(inputVideo) => handleVideoInput(inputVideo, "vid2")} />
      <input type="file" accept="video/*" onChange={(e) => setVideo3(e.target.files?.item(0))} />

      <h3>Resule</h3>

      <button onClick={convertToGif}>Convert</button>

      {gif && <video
        controls
        width="20vw"
        src={gif}></video>}

    </div>
  ) : (<p>Loading FFmpeg</p>)
}


const TimeFormat = ({ videoLength }) => {
  console.log(videoLength);



  return (<>
    <DurationDropDown durationInput={videoLength.h} /> : <DurationDropDown durationInput={videoLength.m} /> : <DurationDropDown durationInput={videoLength.s} />
  </>)
}

const DurationDropDown = ({ durationInput, place }) => {

  return (<>
    <button>{durationInput}</button>
  </>)
}

export default App;
