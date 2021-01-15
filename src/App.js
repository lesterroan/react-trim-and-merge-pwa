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

  useEffect(() => {
    load();
  }, [])

  //logical && operator to show the video elem only when video is defined
  return ready ? (
    <div className="App">

      { video1 && <video
        controls
        with="250%"
        src={URL.createObjectURL(video1)}>
      </video>}

      <hr />

      { video2 && <video
        controls
        with="250%"
        src={URL.createObjectURL(video2)}>
      </video>}

      <hr />
      { video3 && <video
        controls
        with="250%"
        src={URL.createObjectURL(video3)}>
      </video>}

      <input type="file" accept="video/*" onChange={(e) => setVideo1(e.target.files?.item(0))} />
      <input type="file" accept="video/*" onChange={(e) => setVideo2(e.target.files?.item(0))} />
      <input type="file" accept="video/*" onChange={(e) => setVideo3(e.target.files?.item(0))} />

      <h3>Resule</h3>

      <button onClick={convertToGif}>Convert</button>

      {gif && <video
        controls
        with="250%"
        src={gif}></video>}

    </div>
  ) : (<p>Loading FFmpeg</p>)
}

export default App;
