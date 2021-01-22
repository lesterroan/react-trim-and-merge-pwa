import logo from './logo.svg';
import { useState, useEffect } from 'react'
import './App.css';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'

const ffmpeg = createFFmpeg({ log: true });


function App() {

  const [ready, setReady] = useState(false);
  const [video1, setVideo1] = useState();
  const [video2, setVideo2] = useState();
  const [video3, setVideo3] = useState();


  // const [vid1Start, setVid1Start] = useState({ "h": "00", "m": "00", "s": "00" });
  // const [vid2Start, setVid2Start] = useState(0);
  // const [vid3Start, setVid3Start] = useState(0);

  const [finalVid, setFinalVid] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  }


  const convertToGif = async () => {

    ffmpeg.FS('writeFile', 'vid1.mp4', await fetchFile(video1))
    ffmpeg.FS('writeFile', 'vid2.mp4', await fetchFile(video2))
    ffmpeg.FS('writeFile', 'vid3.mp4', await fetchFile(video3))


    await ffmpeg.run("-i", 'vid1.mp4', "-i", 'vid2.mp4', "-i", 'vid3.mp4',
      "-filter_complex", "[0:v:0]trim=start=00:00:00:end=00:00:03,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v0],[0:a:0]atrim=start=00:00:00:end=00:00:03,asetpts=PTS-STARTPTS[a0],[1:v:0]trim=start=00:00:00:end=00:00:03,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v1],[1:a:0]atrim=start=00:00:00:end=00:00:03,asetpts=PTS-STARTPTS[a1],[2:v:0]trim=start=00:00:00:end=00:00:03,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v2],[2:a:0]atrim=start=00:00:00:end=00:00:03,asetpts=PTS-STARTPTS[a2],[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[outv][outa]", "-vsync", "2", "-map", "[outv]", "-map", "[outa]", '-s', '1920x1080', "output.mp4")

    const data = ffmpeg.FS('readFile', 'output.mp4');

    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setFinalVid(url);
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
      // const file = await loadVideo(fileInput.currentTarget.files[0]);
      // const duration = new Date(null);
      // duration.setSeconds(file.duration);
      // const time = duration.toISOString().substr(11, 8);
      // console.log(time);
      // const hour = time.substr(0, 2)
      // const min = time.substr(3, 2)
      // const sec = time.substr(6, 2)

      //setVid1Start({ h: hour, m: min, s: sec })

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

      <h1>Cut and Merge Progressive Web Applications</h1>
      <h3>Made With React and FFmpeg.wasm</h3>

      <div className="centerDiv">
        <div className="videoGroup" >
          {video1 && <video
            controls
            width="240" height="160"
            src={URL.createObjectURL(video1)}>
          </video>}
          {!video1 && <canvas id="myCanvas" width="240" height="160" className="emptyVideo">
          </canvas>}
          {/* <TimeFormat videoLength={vid1Start} /> */}
          <input type="file" accept="video/*" onChange={(inputVideo) => handleVideoInput(inputVideo, "vid1")} />
        </div>


        <div className="videoGroup">
          {video2 && <video
            controls
            width="240" height="160"
            src={URL.createObjectURL(video2)}>
          </video>}
          {!video2 && <canvas id="myCanvas" width="240" height="160" className="emptyVideo">
          </canvas>}
          <input type="file" accept="video/*" onChange={(e) => setVideo2(e.target.files?.item(0))} />
        </div>




        <div className="videoGroup">
          {video3 && <video
            controls
            width="240" height="160"
            src={URL.createObjectURL(video3)}>
          </video>}

          {!video3 && <canvas id="myCanvas" width="240" height="160" className="emptyVideo">
          </canvas>}

          <input type="file" accept="video/*" onChange={(e) => setVideo3(e.target.files?.item(0))} />
        </div>

      </div>

      <h3>Result</h3>

      <button onClick={convertToGif}>Convert</button>

      {
        finalVid && <video
          controls
          width="320" height="240"
          src={finalVid}></video>
      }

    </div >
  ) : (<p>Loading FFmpeg</p>)
}


const TimeFormat = ({ videoLength }) => {
  console.log(videoLength);



  return (<>
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent"
    }}>
      <DurationDropDown durationInput={videoLength.h} /> : <DurationDropDown durationInput={videoLength.m} /> : <DurationDropDown durationInput={videoLength.s} />
    </div>
  </>)
}

const DurationDropDown = ({ durationInput, place }) => {

  return (<>
    <button>{durationInput}</button>
  </>)
}

export default App;
