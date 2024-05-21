// QueueList.js
import React from "react";
import { Table } from "react-bootstrap";

function QueueList({ queues }) {
  return (
    <Table striped hover responsive>
      <thead>
        <tr style={{ backgroundColor: "#f2f2f2" }}>
          <th style={{ color: "purple", fontWeight: "bold" }}>
            <h1>Queue</h1>
          </th>
          <th style={{ color: "purple", fontWeight: "bold" }}>
            <h1>Room</h1>
          </th>
        </tr>
      </thead>
      <tbody>
        {queues
          .filter((item) => item.StatusQ === 2)
          .reverse() // กลับด้านข้อมูล
          .map((item, index) => (
            <tr style={{ backgroundColor: "#ffcccc" }} key={index}>
              <td>
                <h2>{item.VN}</h2>
              </td>
              <td>
                <h2>{item.Rooms}</h2>
              </td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
}

export default QueueList;
