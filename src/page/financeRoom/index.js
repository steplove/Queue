import React, { useState, useEffect, useCallback, useRef } from "react";
import { BASE_URL } from "../../constants/constants";
import { Row, Col } from "react-bootstrap";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
// import "./styles.css";
import SlideComponent from "../../components/SlideComponent";

const SSEComponent = () => {
  const [data, setData] = useState([]);
  const [dataDrug, setDataDrug] = useState([]);
  const [lastData, setLastData] = useState(null);
  const [lastDataDrug, setLastDataDrug] = useState(null);
  const [lastDataQueue, setLastDataQueue] = useState(null);
  const [lastDataQueueDrug, setLastDataQueueDrug] = useState(null);
  const [lastDataQueueWait, setLastDataQueueWait] = useState([]);
  const [lastDataDrugQueueWait, setLastDataDrugQueueWait] = useState([]);
  const url = "http://localhost:3000/assets/audio/";
  const please = "http://localhost:3000/assets/audio/please.mp3";
  const cashier = "http://localhost:3000/assets/audio/pay_cashier.mp3";
  const paydrug = "http://localhost:3000/assets/audio/pay-drug.mp3";
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
        // const roomVN = newDataQueue[0].Rooms;
        const soundFiles = latestData
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        // const soundFilesRooms = roomVN
        //   .split("")
        //   .map((digit) => `${url}${digit}.mp3`);
        const combinedSrcArray = [please, ...soundFiles, cashier];
        const newCombinedSrcArray = combinedSrcArray.concat(
          // soundFilesRooms,
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
    [url, please, cashier, ka, playNextSound]
  );
  const runFunctionDrug = useCallback(
    (newDataQueue) => {
      if (newDataQueue && newDataQueue.length > 0) {
        const latestData = newDataQueue[0].VN;
        // const roomVN = newDataQueue[0].Rooms;
        const soundFiles = latestData
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        // const soundFilesRooms = roomVN
        //   .split("")
        //   .map((digit) => `${url}${digit}.mp3`);
        const combinedSrcArray = [please, ...soundFiles, paydrug];
        const newCombinedSrcArray = combinedSrcArray.concat(
          // soundFilesRooms,
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
    [url, please, paydrug, ka, playNextSound]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "PageUp") {
        fetch(`${BASE_URL}/api/queueF`)
          .then((response) => response.json())
          .then((data) => {
            runFunction(data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      } else if (event.key === "PageDown") {
        fetch(`${BASE_URL}/api/queueD`)
          .then((response) => response.json())
          .then((data) => {
            runFunctionDrug(data);
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      }
    },
    [runFunction, runFunctionDrug]
  );

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/api/queueFinanceRoom`);
    const eventSourceQueue = new EventSource(`${BASE_URL}/api/queueFinance`);
    const eventSourceQueueWait = new EventSource(
      `${BASE_URL}/api/queueuserWaitFinance`
    );
    const eventSourceDrug = new EventSource(`${BASE_URL}/api/queueDrugRoom`);
    const eventSourceDrugQueue = new EventSource(`${BASE_URL}/api/queueDrug`);
    const eventSourceDrugQueueWait = new EventSource(
      `${BASE_URL}/api/queueuserWaitDrug`
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

    eventSourceDrug.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setDataDrug(newData);
      if (!isEqual(newData, lastDataDrug)) {
        setLastDataDrug(newData);
      }
    };

    eventSourceDrugQueue.onmessage = (event) => {
      const newDataQueue = JSON.parse(event.data);
      if (!isEqual(newDataQueue, lastDataQueueDrug)) {
        runFunctionDrug(newDataQueue);
        setLastDataQueueDrug(newDataQueue);
      }
    };
    eventSourceDrugQueueWait.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      if (!isEqual(newData, lastDataDrug)) {
        setLastDataDrugQueueWait(newData);
      }
    };
    return () => {
      eventSource.close();
      eventSourceQueue.close();
      eventSourceQueueWait.close();
      eventSourceDrug.close();
      eventSourceDrugQueue.close();
      eventSourceDrugQueueWait.close();
    };
  }, [
    lastData,
    lastDataQueue,
    lastDataDrug,
    lastDataQueueDrug,
    runFunction,
    runFunctionDrug,
  ]);

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
                    marginRight: "7%",
                    marginLeft: "10%",
                  }}
                >
                  ห้องการเงิน
                </p>
                <div
                  style={{
                    float: "left",
                    borderRight: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginRight: "15%",
                    height: "75%",
                    marginTop: "10px",
                  }}
                ></div>
                <p style={{}}>ห้องยา</p>
              </div>
              <div style={{ display: "flex", flexDirection: "row" }}>
                {data.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "#9575CD",
                      fontSize: `5rem`,
                      fontWeight: "bold",
                      borderRadius: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "300px",
                      width: "45%",
                      textShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                      boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                      marginTop: "10px",
                    }}
                  >
                    ยังไม่มีคิว
                  </div>
                ) : (
                  data
                    .filter((item) => item.StatusQ === 4)
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
                          width: "45%",
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
                              marginRight: "0%",
                              marginLeft: "0",
                            }}
                            className="blinking-text"
                          >
                            {item.VN}
                          </p>
                        </div>
                      </div>
                    ))
                )}
                <div
                  style={{
                    float: "center",
                    borderLeft: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginLeft: "2.7%",
                    marginRight: "-5%",
                    height: "300px",
                    marginTop: "10px",
                  }}
                ></div>
                <div
                  style={{
                    // float: "left",
                    borderRight: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginRight: "0%",
                    marginLeft: "5%",
                    height: "75%",
                    marginTop: "10px",
                  }}
                ></div>
                {dataDrug.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "#9575CD",
                      fontSize: `5rem`,
                      fontWeight: "bold",
                      borderRadius: "50px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "300px",
                      width: "45%",
                      textShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                      boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                      marginTop: "10px",
                    }}
                  >
                    ยังไม่มีคิว
                  </div>
                ) : (
                  dataDrug
                    .filter((item) => item.StatusQ === 6)
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
                          width: "45%",
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
                              marginRight: "0%",
                              marginLeft: "0",
                            }}
                            className="blinking-text"
                          >
                            {item.VN}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>

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
                  รอเรียกคิว
                </p>
              </div>
              <div
                style={{ display: "flex", flexDirection: "row", width: "48%" }}
              >
                <Col lg={12}>
                  {lastDataQueueWait.length === 0 ? (
                    <Col lg={12}>
                      <div
                        style={{
                          backgroundColor: "#B39DDB",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "10px",
                          width: "35%",
                          height: "10%",
                          fontSize: "2rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                          boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                          margin: "10px",
                        }}
                      >
                        <p>ไม่มีคิว</p>
                      </div>
                    </Col>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "left",
                      }}
                    >
                      {lastDataQueueWait
                        .filter((item) => item.StatusQ === 3)
                        .map((item, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "#B39DDB",
                              color: "#ffffff",
                              padding: "10px",
                              borderRadius: "10px",
                              width: "25%",
                              height: "25%",
                              fontSize: "2.5rem",
                              textAlign: "center",
                              fontWeight: "bold",
                              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                              boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                              margin: "10px",
                              boxSizing: "border-box",
                            }}
                          >
                            <p>{item.VN}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </Col>
                <div
                  style={{
                    float: "center",
                    borderLeft: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginRight: "15%",
                    height: "250px",
                    marginTop: "10px",
                  }}
                ></div>
                <Col lg={12}>
                  {lastDataDrugQueueWait.length === 0 ? (
                    <Col lg={12}>
                      <div
                        style={{
                          backgroundColor: "#B39DDB",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "10px",
                          width: "35%",
                          height: "10%",
                          fontSize: "2rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                          boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                          margin: "10px",
                          marginLeft: "-20%",
                        }}
                      >
                        <p>ไม่มีคิว</p>
                      </div>
                    </Col>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "left",
                        marginLeft: "-18%",
                      }}
                    >
                      {lastDataDrugQueueWait
                        .filter((item) => item.StatusQ === 5)
                        .map((item, index) => (
                          <div
                            key={index}
                            style={{
                              backgroundColor: "#B39DDB",
                              color: "#ffffff",
                              padding: "10px",
                              borderRadius: "10px",
                              width: "25%",
                              height: "25%",
                              fontSize: "2.5rem",
                              textAlign: "center",
                              fontWeight: "bold",
                              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                              boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                              margin: "10px",
                              boxSizing: "border-box",
                            }}
                          >
                            <p>{item.VN}</p>
                          </div>
                        ))}
                    </div>
                  )}
                </Col>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SSEComponent;
