// import logo from './logo.svg';
import { useState, useEffect } from 'react'
import './App.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Loader from 'react-loader-spinner'

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'


const ffmpeg = createFFmpeg({
  log: false,
});


function App() {


  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");

  const [alert, setAlert] = useState("");

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


  const processVideo = async () => {

    setIsConverting(true);
    setFinalVid(null);



    ffmpeg.FS('writeFile', 'vid1.mp4', await fetchFile(video1))
    ffmpeg.FS('writeFile', 'vid2.mp4', await fetchFile(video2))
    ffmpeg.FS('writeFile', 'vid3.mp4', await fetchFile(video3))





    await ffmpeg.run("-i", 'vid1.mp4', "-i", 'vid2.mp4', "-i", 'vid3.mp4',
      "-filter_complex", "[0:v:0]trim=start=00:00:00:end=00:00:15,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v0],[0:a:0]atrim=start=00:00:00:end=00:00:15,asetpts=PTS-STARTPTS[a0],[1:v:0]trim=start=00:00:00:end=00:00:15,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v1],[1:a:0]atrim=start=00:00:00:end=00:00:15,asetpts=PTS-STARTPTS[a1],[2:v:0]trim=start=00:00:00:end=00:00:15,setdar=16/9,scale=1920x1080,setpts=PTS-STARTPTS[v2],[2:a:0]atrim=start=00:00:00:end=00:00:15,asetpts=PTS-STARTPTS[a2],[v0][a0][v1][a1][v2][a2]concat=n=3:v=1:a=1[outv][outa]", "-vsync", "2", "-map", "[outv]", "-map", "[outa]", '-s', '1920x1080', "output.mp4")



    const data = ffmpeg.FS('readFile', 'output.mp4');

    const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }));
    setFinalVid(url);

    setIsConverting(false);
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

    if (vidNum === "vid1") {

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
  const handleCutAndMerge = () => {

    if (video1 === undefined) {
      handleAlert('Video 1')
    } else if (video2 === undefined) {
      handleAlert('Video 2')
    } else if (video3 === undefined) {
      handleAlert('Video 3')
    }
    else {
      setAlert(undefined);
      processVideo();
    };
  }
  const handleAlert = (msg) => {
    console.log(msg);
    setAlert(msg)
  }

  useEffect(() => {
    load();

    ffmpeg.setLogger(({ type, message }) => {
      if (type !== 'info') {
        setMessage(message);
        console.log(message);
      }
    });
    ffmpeg.setProgress(({ ratio }) => {
      if (ratio >= 0 && ratio <= 1) {
        setProgress(`${(ratio * 100.0).toFixed(2)}%`);
        console.log((ratio * 100.0).toFixed(2))
      }
      if (ratio === 1) {
        setTimeout(() => { setProgress(""); }, 1000);
      }
    });
  }, [])

  return ready ? (
    <div className="App">
      {alert && <span className="alert">NO {alert} input!</span>}
      <h1>Cut* and Merge Progressive Web Application</h1>

      {!isConverting && <div className="centerDiv">
        <div className="videoGroup" >
          {video1 && <video
            controls
            width="360" height="240"
            src={URL.createObjectURL(video1)}>
          </video>}
          {!video1 && <canvas id="myCanvas" width="360" height="240" className="emptyVideo">
          </canvas>}
          <input type="file" accept="video/*" onChange={(inputVideo) => handleVideoInput(inputVideo, "vid1")} />
        </div>


        <div className="videoGroup">
          {video2 && <video
            controls
            width="360" height="240"
            src={URL.createObjectURL(video2)}>
          </video>}
          {!video2 && <canvas id="myCanvas" width="360" height="240" className="emptyVideo">
          </canvas>}
          <input type="file" accept="video/*" onChange={(e) => setVideo2(e.target.files?.item(0))} />
        </div>

        <div className="videoGroup">
          {video3 && <video
            controls
            width="360" height="240"
            src={URL.createObjectURL(video3)}>
          </video>}

          {!video3 && <canvas id="myCanvas" width="360" height="240" className="emptyVideo">
          </canvas>}

          <input type="file" accept="video/*" onChange={(e) => setVideo3(e.target.files?.item(0))} />
        </div>

      </div>
      }
      <div className="videoGroup">
        {isConverting && <p>Cutting and Merging Videos. Please Wait...</p>}
        <Loader
          type="ThreeDots"
          color="#fa476e"
          height={50}
          width={50}
          visible={isConverting}

        />
        {
          finalVid && <video
            controls
            width="720" height="480"
            src={finalVid}></video>
        }
        {!isConverting && <span className="cutAndMerge" onClick={handleCutAndMerge}>Cut and Merge</span>}
        <p className="progress">{progress}</p>
        {/* <p >{message}</p> */}
      </div>

      <p>*default: first 15 seconds</p>

      <div className="footer">
        <p>👨‍💻<a className="githubLink" href="https://github.com/lesterroan/react-trim-and-merge-pwa" target="_blank">Made With React and FFmpeg.wasm</a></p>
      </div>
    </div >
  ) : (<div className="videoGroup">
    <span>Loading FFmpeg...please wait</span>
    <span> <Loader
      type="ThreeDots"
      color="#fa476e"
      height={50}
      width={50}
      visible={true}
    /></span>
    <span className="warning">Does not work on Firefox 79+ and Mobile yet, please use Chrome or Edge Desktop</span>
  </div>)
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
