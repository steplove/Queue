import React, { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../../constants/constants";
import { Col, Button, Modal, Form } from "react-bootstrap";
import Header from "../../components/Header";
import axios from "axios";
function ManualQueue() {
  const [fillPost, setFillPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [lastData, setLastData] = useState(null);
  const [callagain, setCallagain] = useState(null);
  const [checkrooms, setCheckrooms] = useState(null);

  const setip = "1";

  const repeatQueue = () => {
    try {
      if (callagain) {
        const dataToSend = {
          VisitNumber: callagain.VisitNumber,
          Station: 4,
        };

        console.log("Data to send:", dataToSend);

        axios
          .post(`${BASE_URL}/api/updatecall`, dataToSend, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Success:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        setShowModal(false);
      } else {
        console.error("callagain array is empty or undefined");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleButtonClick = () => {
    repeatQueue();
  };

  const breakQueue = () => {
    try {
      if (lastData) {
        const dataToSend = {
          Station: lastData.Station,
        };
        console.log("Data to send:", dataToSend);
        axios
          .post(`${BASE_URL}/api/updatebreak`, dataToSend, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Success:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      } else {
        console.error("callagain array is empty or undefined");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleButtonClickbreak = () => {
    breakQueue();
  };
  const isEqual = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "PageUp") {
      fetch(`${BASE_URL}/api/queueTest2`)
        .then((response) => response.json())
        .then((data) => {})
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, []);

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
      setCheckrooms(data);
      setPosts(data);
      const filteredPosts = data.filter(
        (post) => post.PresStatus === "Sent_to_doctor" && post.Station === 4
      );
      const newDataQueue = filteredPosts.sort(
        (a, b) => new Date(b.MWhen) - new Date(a.MWhen)
      )[0];

      if (!isEqual(newDataQueue, lastData)) {
        setFillPost(newDataQueue);
        setLastData(newDataQueue);
        setCallagain(newDataQueue);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
    };

    return () => {
      eventSource.close();
    };
  }, [lastData]);

  const handleShowModal = (queue) => {
    setSelectedQueue(queue);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSelectRoom = (room) => {
    let rooms = room.toString();
    console.log(rooms, "rooms");
    console.log(
      "เลือกห้องที่เข้าพบหมอ",
      typeof rooms,
      "room.toString() มีค่า",
      rooms === "" ? "<empty string>" : rooms
    );
    // console.log(
    //   checkrooms.filter((post) => post.PresStatus ===  "Sent_to_doctor"),
    //   "checkrooms"
    // );
    let checkroom = checkrooms.filter(
      (post) =>
        post.PresStatus === "Sent_to_doctor" &&
        post.Rooms === rooms &&
        post.Station === 4
    );
    console.log(checkroom, "checkroom");
    if (checkroom.length > 0) {
      checkroom.forEach((room) => {
        console.log(
          "พบคนก่อนหน้า",
          "เลข VisitNumber:",
          room.VisitNumber,
          "ที่ห้องตรวจที่:",
          room.Rooms
        );
        const dataToSendOLD = {
          VisitNumber: room.VisitNumber,
          Rooms: room.Rooms,
          PresStatus: "Waiting_to_pay",
        };
        if (dataToSendOLD) {
          axios
            .post(`${BASE_URL}/api/update-room`, dataToSendOLD, {
              headers: {
                "Content-Type": "application/json",
              },
            })
            .then((response) => {
              console.log("Success:", response.data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }
        const dataToSend = {
          VisitNumber: selectedQueue,
          Rooms: rooms,
          PresStatus: "Sent_to_doctor",
        };
        if (dataToSend) {
          axios
            .post(`${BASE_URL}/api/update-room`, dataToSend, {
              headers: {
                "Content-Type": "application/json",
              },
            })
            .then((response) => {
              console.log("Success:", response.data);
            })
            .catch((error) => {
              console.error("Error:", error);
            });
        }

        setShowModal(false);
      });
    } else {
      console.log("ไม่พบคนก่อนหน้า");
      if (room) {
        console.log(`เรียกคิวหมายเลข ${selectedQueue} ไปยังห้อง ${room}`);
        const dataToSend = {
          VisitNumber: selectedQueue,
          Rooms: rooms,
          PresStatus: "Sent_to_doctor",
        };

        axios
          .post(`${BASE_URL}/api/update-room`, dataToSend, {
            headers: {
              "Content-Type": "application/json",
            },
          })
          .then((response) => {
            console.log("Success:", response.data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });

        setShowModal(false);
      }
    }
  };
  const displayedPosts = posts.filter(
    (item) => item.PresStatus === "Registered" && item.Station === 4
  );

  const placeholders = Array.from(
    { length: Math.max(0, 9 - displayedPosts.length) },
    (_, i) => ({ VisitNumber: `Placeholder ${i + 1}` })
  );
  return (
    <div
      style={{
        backgroundColor: "#EDE7F6",
        zIndex: "0",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backdropFilter: "blur(30px) brightness(70%)",
        height: "100vh",
      }}
    >
      <div
        style={{
          paddingTop: "30px",
          paddingBottom: "30px",
          marginLeft: "50px",
        }}
      >
        <Header />
      </div>
      {setip === "1" ? (
        <Col lg={12} sm={12} md={12} style={{ textAlign: "center" }}>
          <div style={queueDisplay}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                textAlign: "center",
              }}
            >
              {fillPost ? (
                <>
                  <div style={queueItem}>
                    <p>คิวปัจจุบัน</p>
                    <p>{fillPost.VisitNumber}</p>
                  </div>
                  <div style={queueItem}>
                    <p>ห้องตรวจ</p>
                    <p>{fillPost.Rooms}</p>
                  </div>
                </>
              ) : (
                <Col lg={12}>
                  <div style={queueItem}>
                    <p></p>
                  </div>
                </Col>
              )}
            </div>
            <Col lg={12}>
              <p style={boxtitle}>รอเรียกตรวจ</p>
              {displayedPosts.length === 0 ? (
                <Col lg={12}>
                  <div style={boxStyle}>
                    <p></p>
                  </div>
                </Col>
              ) : (
                <div style={boxContainer}>
                  {displayedPosts
                    .concat(placeholders)
                    .slice(0, 9)
                    .filter(
                      (item) =>
                        item.PresStatus === "Registered" && item.Station === 4
                    )
                    .map((item, index) => (
                      <div
                        key={index}
                        style={boxStyle}
                        onClick={() => handleShowModal(item.VisitNumber)}
                      >
                        <p>{item.VisitNumber}</p>
                      </div>
                    ))}
                </div>
              )}
            </Col>
          </div>
          <div style={buttonGroup}>
            <Button
              variant="primary"
              onClick={handleButtonClick}
              style={buttonStyle}
            >
              เรียกคิวซ้ำ
            </Button>
            <Button
              variant="secondary"
              style={buttonStyle}
              onClick={handleButtonClickbreak}
            >
              พักคิว
            </Button>
          </div>
        </Col>
      ) : null}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>VisitNumber:{selectedQueue} เลือกห้องตรวจ </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formRoomSelect">
              <div style={boxStyleRooms}>
                {[1, 2, 3, 4].map((roomNumber) => (
                  <div
                    key={roomNumber}
                    style={roomButtonStyle}
                    onClick={() => handleSelectRoom(roomNumber)}
                  >
                    {roomNumber}
                  </div>
                ))}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

const queueDisplay = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  margin: "20px 0",
};

const queueItem = {
  margin: "auto",
  textAlign: "center",
  paddingRight: "10%",
  paddingLeft: "10%",
  fontSize: "1.5rem",
  fontWeight: "bold",
};

const buttonGroup = {
  display: "flex",
  justifyContent: "center",
  gap: "20px",
  marginTop: "20px",
};

const buttonStyle = {
  fontSize: "1.2rem",
  padding: "10px 20px",
};

const boxContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
};

const boxStyle = {
  backgroundColor: "#B39DDB",
  color: "#ffffff",
  padding: "10px",
  borderRadius: "10px",
  width: "5%",
  height: "50px",
  fontSize: "1rem",
  textAlign: "center",
  fontWeight: "bold",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
  margin: "5px",
  flexGrow: 1,
};
const boxStyleRooms = {
  display: "flex",
  marginTop: "10px",
  gap: "10px", // Space between room buttons
  justifyContent: "center", // Center items horizontally
  flexWrap: "wrap", // Wrap items to the next row
};

const roomButtonStyle = {
  backgroundColor: "#B39DDB",
  color: "#ffffff",
  padding: "10px",
  borderRadius: "10px",
  width: "5%",
  height: "50px",
  fontSize: "1rem",
  textAlign: "center",
  fontWeight: "bold",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
  margin: "5px",
  flexGrow: 1,
};
const boxtitle = {
  backgroundColor: "#9575CD",
  color: "#ffffff",
  fontWeight: "bold",
  fontSize: "1.5rem",
  textAlign: "center",
  width: "95%",
  height: "15%",
  borderRadius: "50px",
  textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  boxShadow: "4px 4px 4px rgba(0, 0, 0, 0.3)",
  margin: "10px",
};
export default ManualQueue;
