import React, { useState, useEffect, useCallback, useRef } from "react";
import { BASE_URL, BASE_URL_Sound } from "../../constants/constants";
import { Row, Col } from "react-bootstrap";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SlideComponent from "../../components/SlideComponent";

const SSEComponent = () => {
  const [posts, setPosts] = useState([]);
  const [fillPost, setFillPost] = useState(null);
  const [fillPhamacy, setFillPhamacy] = useState(null);
  const [lastData, setLastData] = useState(null);
  const [lastPhamacy, setLastPhamacy] = useState(null);
  const url = BASE_URL_Sound + "/assets/audio/";
  const please = BASE_URL_Sound + "/assets/audio/please.mp3";
  const cashier = BASE_URL_Sound + "/assets/audio/pay_cashier.mp3";
  const paydrug = BASE_URL_Sound + "/assets/audio/pay-drug.mp3";
  const ka = BASE_URL_Sound + "/assets/audio/ka.mp3";
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
      if (newDataQueue) {
        const latestData = newDataQueue.VisitNumber;
        // const roomVisitNumber = newDataQueue[0].Rooms;
        const soundFiles = latestData
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        // const soundFilesRooms = roomVisitNumber
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
      if (newDataQueue) {
        const latestData = newDataQueue.VisitNumber;
        // const roomVisitNumber = newDataQueue[0].Rooms;
        const soundFiles = latestData
          .split("")
          .map((digit) => `${url}${digit}.mp3`);
        // const soundFilesRooms = roomVisitNumber
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
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const eventSource = new EventSource(`${BASE_URL}/api/queue`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPosts(data);
      //จ่ายเงิน
      const filteredBilling = data.filter((post) => post.PresStatus === "Pay");

      // หาเวลาที่มากที่สุด จ่ายเงิน
      const newDataQueue = filteredBilling.sort(
        (a, b) => new Date(b.MWhen) - new Date(a.MWhen)
      )[0];
      //รับยา
      const filteredPhamacy = data.filter((post) => post.PresStatus === "Drug");
      // หาเวลาที่มากที่สุด รับยา
      const newDataQueuePhamacy = filteredPhamacy.sort(
        (a, b) => new Date(b.MWhen) - new Date(a.MWhen)
      )[0];
      if (!isEqual(newDataQueue, lastData)) {
        setFillPost(newDataQueue);
        runFunction(newDataQueue);
        setLastData(newDataQueue);
      }
      if (!isEqual(newDataQueuePhamacy, lastPhamacy)) {
        setFillPhamacy(newDataQueuePhamacy);
        runFunctionDrug(newDataQueuePhamacy);
        setLastPhamacy(newDataQueuePhamacy);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [lastData, runFunction, lastPhamacy, runFunctionDrug]);

  const displayedPosts = posts.filter(
    (item) => item.PresStatus === "Waiting_to_pay"
  );

  const placeholders = Array.from(
    { length: Math.max(0, 9 - displayedPosts.length) },
    (_, i) => ({ VisitNumber: `Placeholder ${i + 1}` })
  );
  const displayedPostsDrug = posts.filter(
    (item) => item.PresStatus === "Pay" && item.HaveDrug === 1
  );

  const placeholdersDrug = Array.from(
    { length: Math.max(0, 9 - displayedPostsDrug.length) },
    (_, i) => ({ VisitNumber: `Placeholder ${i + 1}` })
  );
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
              <div style={titleTop}>
                <p
                  style={{
                    margin: "0",
                    marginRight: "9%",
                    marginLeft: "8%",
                  }}
                >
                  ห้องจ่ายเงิน
                </p>
                <div
                  style={{
                    float: "center",
                    borderRight: "3px solid darkcyan",
                    paddingRight: "0.5rem",
                    marginRight: "13%",
                    height: "75%",
                    marginTop: "10px",
                  }}
                ></div>
                <p style={{}}>ห้องรับยา</p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                {fillPost ? (
                  <>
                    <Col lg={6}>
                      <div style={boxshowQueue}>
                        <p className="blinking-text">{fillPost.VisitNumber}</p>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col lg={6}>
                    <div style={boxshowQueue}>
                      <p className="blinking-text"></p>
                    </div>
                  </Col>
                )}
                {fillPhamacy ? (
                  <>
                    <Col lg={6}>
                      <div style={boxshowQueue}>
                        <p className="blinking-text">
                          {fillPhamacy.VisitNumber}
                        </p>
                      </div>
                    </Col>
                  </>
                ) : (
                  <Col lg={6}>
                    <div style={boxshowQueue}>
                      <p className="blinking-text"></p>
                    </div>
                  </Col>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  width: "48%",
                  marginTop: "30px",
                }}
              >
                <Col lg={12}>
                  <p
                    style={{
                      backgroundColor: "#9575CD",
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: "2.5rem",
                      textAlign: "center",
                      width: "95%",
                      height: "15%",
                      borderRadius: "50px",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                      boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    รอจ่ายเงิน
                  </p>
                  {/* รอจ่ายเงิน */}
                  {posts.length === 0 ? (
                    <Col lg={12}>
                      <div
                        style={{
                          backgroundColor: "#B39DDB",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "10px",
                          width: "40%",
                          height: "10%",
                          fontSize: "2.5rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                          boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                          margin: "10px",
                        }}
                      >
                        <p></p>
                      </div>
                    </Col>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {displayedPosts
                        .concat(placeholders)
                        .slice(0, 9)
                        .filter((item) => item.PresStatus === "Waiting_to_pay")
                        .map((item, index) => (
                          <div key={index}>
                            <div
                              key={index}
                              style={{
                                backgroundColor: "#B39DDB",
                                color: "#ffffff",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "85%",
                                height: "70%",
                                fontSize: "2.5rem",
                                textAlign: "center",
                                fontWeight: "bold",
                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                                margin: "10px",
                              }}
                            >
                              <p>{item.VisitNumber}</p>
                            </div>
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
                    marginRight: "0",
                    height: "480px",
                    marginTop: "20px",
                  }}
                ></div>
                <Col lg={12}>
                  <p
                    style={{
                      backgroundColor: "#9575CD",
                      color: "#ffffff",
                      fontWeight: "bold",
                      fontSize: "2.5rem",
                      textAlign: "center",
                      width: "95%",
                      height: "15%",
                      borderRadius: "50px",
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                      boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    รอรับยา
                  </p>
                  {/* รอรับยา */}
                  {displayedPostsDrug.length === 0 ? (
                    <Col lg={12}>
                      <div
                        style={{
                          backgroundColor: "#B39DDB",
                          color: "#ffffff",
                          padding: "10px",
                          borderRadius: "10px",
                          width: "40%",
                          height: "10%",
                          fontSize: "2.5rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                          boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                          margin: "10px",
                        }}
                      >
                        <p></p>
                      </div>
                    </Col>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
                      {displayedPostsDrug
                        .concat(placeholdersDrug)
                        .slice(0, 9)
                        .filter(
                          (item) =>
                            item.PresStatus === "Pay" && item.HaveDrug === 1
                        )
                        .map((item, index) => (
                          <div key={index}>
                            <div
                              key={index}
                              style={{
                                backgroundColor: "#B39DDB",
                                color: "#ffffff",
                                padding: "10px",
                                borderRadius: "10px",
                                width: "85%",
                                height: "70%",
                                fontSize: "2.5rem",
                                textAlign: "center",
                                fontWeight: "bold",
                                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                                boxShadow: "4px 4px 4px 4px rgba(0, 0, 0, 0.3)",
                                margin: "10px",
                              }}
                            >
                              <p>{item.VisitNumber}</p>
                            </div>
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

const titleTop = {
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
  marginTop: "-10%",
};
const boxshowQueue = {
  backgroundColor: "#B39DDB",
  fontSize: "10rem",
  fontWeight: "bold",
  borderRadius: "20px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "300px",
  width: "95%",
  textShadow: "2px 2px 2px rgba(0, 0, 0, 0.3)",
  boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.3)",
  marginTop: "30px",
};
export default SSEComponent;
