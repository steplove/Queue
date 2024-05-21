import React, { useState, useEffect, useCallback, useRef } from "react";
import { BASE_URL } from "../../constants/constants";
import { Row, Col } from "react-bootstrap";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./styles.css";
import SlideComponent from "../../components/SlideComponent";

const SSEComponent = () => {
  const [data, setData] = useState([]);
  const [lastData, setLastData] = useState(null);
  const [lastDataQueue, setLastDataQueue] = useState(null);
  const [lastDataQueueWait, setLastDataQueueWait] = useState([]);
  const url = "http://localhost:3000/assets/audio/";
  const please = "http://localhost:3000/assets/audio/please.mp3";
  const doctor_room = "http://localhost:3000/assets/audio/doctor_room.mp3";
  const ka = "http://localhost:3000/assets/audio/ka.mp3";
  const isPlayingRef = useRef(false);
  const audioQueue = useRef([]);

  const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

  const playNextSound = useCallback(() => {
    if (audioQueue.current.length > 0) {
      const currentSoundArray = audioQueue.current.shift();
      let currentSoundIndex = 0;

      const playCurrentSoundArray = () => {
        if (currentSoundIndex < currentSoundArray.length) {
          const soundFile = currentSoundArray[currentSoundIndex];
          const audio = new Audio(`${soundFile}`);
          audio.addEventListener("ended", () => {
            currentSoundIndex++;
            playCurrentSoundArray();
          });
          audio.play();
        } else {
          isPlayingRef.current = false;
          if (audioQueue.current.length > 0) {
            isPlayingRef.current = true;
            playNextSound();
          }
        }
      };

      isPlayingRef.current = true;
      playCurrentSoundArray();
    }
  }, []);

  const runFunction = useCallback(
    (newDataQueue) => {
      if (newDataQueue && newDataQueue.length > 0) {
        const latestData = newDataQueue[0].VN;
        const roomVN = newDataQueue[0].Rooms;
        const soundFiles = latestData
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        const soundFilesRooms = roomVN
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        const combinedSrcArray = [please, ...soundFiles, doctor_room];
        const newCombinedSrcArray = combinedSrcArray.concat(
          soundFilesRooms,
          ka
        );

        audioQueue.current.push(newCombinedSrcArray);

        if (!isPlayingRef.current) {
          playNextSound();
        }
      } else {
        console.log("ไม่มีข้อมูลใหม่");
      }
    },
    [url, please, doctor_room, ka, playNextSound]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "PageUp") {
        fetch(`${BASE_URL}/api/queueTest2`)
          .then((response) => response.json())
          .then((data) => {
            runFunction(data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }
    },
    [runFunction]
  );

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/api/queueuser`);
    const eventSourceQueue = new EventSource(`${BASE_URL}/api/queue`);
    const eventSourceQueueWait = new EventSource(
      `${BASE_URL}/api/queueuserWait`
    );

    eventSource.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData(newData);
      if (!isEqual(newData, lastData)) {
        setLastData(newData);
      }
    };

    eventSourceQueue.onmessage = (event) => {
      const newDataQueue = JSON.parse(event.data);
      if (!isEqual(newDataQueue, lastDataQueue)) {
        runFunction(newDataQueue);
        setLastDataQueue(newDataQueue);
      }
    };

    eventSourceQueueWait.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (!isEqual(newData, lastData)) {
        setLastDataQueueWait(newData);
      }
    };

    return () => {
      eventSource.close();
      eventSourceQueue.close();
      eventSourceQueueWait.close();
    };
  }, [lastData, lastDataQueue, runFunction]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#EDE7F6",
          zIndex: "0",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backdropFilter: "blur(30px) brightness(70%)",
        }}
      >
        <div>
          <div
            style={{
              paddingTop: "30px",
              paddingBottom: "30px",
              marginLeft: "50px",
            }}
          >
            <Header />
          </div>
          <Row>
            <Col lg={6}>
              <div style={{ width: "100%", height: "100%" }}>
                <SlideComponent />
              </div>
            </Col>
            <Col lg={6}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  backgroundColor: "#9575CD",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "3.5rem",
                  textAlign: "center",
                  width: "95%",
                  height: "10%",
                  borderRadius: "50px",
                  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                  boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    marginRight: "9%",
                    marginLeft: "20%",
                  }}
                >
                  หมายเลข
                </p>
                <div
                  style={{
                    float: "left",
                    borderRight: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginRight: "8%",
                    height: "75%",
                    marginTop: "10px",
                  }}
                ></div>
                <p style={{}}>ห้องตรวจ</p>
              </div>

              {data.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#9575CD",
                    fontSize: `9rem`,
                    fontWeight: "bold",
                    borderRadius: "50px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "300px",
                    width: "95%",
                    textShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                    boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                    marginTop: "10px",
                  }}
                >
                  ยังไม่มีคิว
                </div>
              ) : (
                data
                  .filter((item) => item.StatusQ === 2)
                  .map((item, index) => (
                    <div
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#B39DDB" : "#D1C4E9",
                        fontSize: `${index === 0 ? 10 : 3}rem`,
                        fontWeight: "bold",
                        borderRadius: "50px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "300px",
                        width: "95%",
                        textShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                        boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                        marginTop: "10px",
                      }}
                      key={index}
                    >
                      <div style={{ display: "flex", flexDirection: "row" }}>
                        <p
                          style={{
                            margin: "0",
                            marginRight: "20%",
                            marginLeft: "-30%",
                          }}
                          className="blinking-text"
                        >
                          {item.VN}
                        </p>
                        <div
                          style={{
                            float: "left",
                            borderRight: "3px solid darkcyan",
                            paddingRight: "0.5rem",
                            marginRight: "30%",
                          }}
                        ></div>
                        <p
                          style={{
                            margin: "0",
                          }}
                          className="blinking-text"
                        >
                          {item.Rooms}
                        </p>
                      </div>
                    </div>
                  ))
              )}
              <div style={{ marginTop: "10px" }}>
                <p
                  style={{
                    backgroundColor: "#9575CD",
                    color: "#ffffff",
                    fontWeight: "bold",
                    fontSize: "3.5rem",
                    textAlign: "center",
                    width: "95%",
                    height: "10%",
                    borderRadius: "50px",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                    boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  คิวรอเข้าห้องตรวจ
                </p>
              </div>
              {lastDataQueueWait.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "#B39DDB",
                    color: "#ffffff",
                    padding: "10px",
                    borderRadius: "10px",
                    width: "20%",
                    height: "10%",
                    fontSize: "2.5rem",
                    textAlign: "center",
                    fontWeight: "bold",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                    boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                    margin: "10px",
                  }}
                >
                  <p>ไม่มีคิว</p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {lastDataQueueWait
                    .filter((item) => item.StatusQ === 1)
                    .map((item, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: "#B39DDB",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "10px",
                          width: "20%",
                          height: "10%",
                          fontSize: "2.5rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                          boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                          margin: "10px",
                        }}
                      >
                        <p>{item.VN}</p>
                      </div>
                    ))}
                </div>
              )}
            </Col>
          </Row>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SSEComponent;
