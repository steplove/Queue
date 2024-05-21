import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../constants/constants";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
const TestSound = () => {
  const [cont1, setCount1] = useState("");
  const url = "http://localhost:3000/assets/audio/";
  const please = "http://localhost:3000/assets/audio/please.mp3";
  const doctor_room = "http://localhost:3000/assets/audio/doctor_room.mp3";
  const [audioIndex, setAudioIndex] = useState(0);
  const [dataQueue, setDataQueue] = useState("");
  useEffect(() => {
    let isMounted = true;

    const fetchDataQueue = async () => {
      try {
        const response = await fetch(BASE_URL + "/api/queueTest");
        const data = await response.json(); // แปลงข้อมูล Response เป็น JSON
        console.log(data[0].VN, "datadata");

        if (isMounted) {
          setDataQueue(data[0].VN);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchDataQueue();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCountButtonClick = () => {
    const runNum = dataQueue
    console.log("runNum number:", runNum);
    setCount1(runNum);
    setAudioIndex(0);
  };
  const srcArray = cont1.split("").map((num) => `${url}${num}.mp3`);
  const combinedSrcArray = [please, ...srcArray, doctor_room];
  console.log(combinedSrcArray.length, "srcArray", cont1);

  function randomNumber() {
    return Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
  }
  return (
    <div className="container">
      <h1>Hello, audio player!</h1>
      <AudioPlayer
        src={combinedSrcArray[audioIndex]}
        volume={0.5}
        autoPlay
        autoPlayAfterSrcChange
        style={{ display: "none" }}
        onPlay={() => console.log("playing")}
        onEnded={() =>
          setAudioIndex((prevIndex) => {
            const nextIndex = prevIndex + 1;
            if (nextIndex < combinedSrcArray.length) {
              return nextIndex; //เล่นไฟล์ต่อไป
            } else {
              return prevIndex; //หยุด
            }
          })
        }
      />
      <button onClick={handleCountButtonClick}>Count</button>
    </div>
  );
};

export default TestSound;
