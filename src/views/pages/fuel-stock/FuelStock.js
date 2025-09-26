/* eslint-disable prettier/prettier */
import React, { useState } from "react";
import { Row, Col, Pagination, Tag, Progress } from "antd";
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardText,
} from "@coreui/react";

// generate dummy 100 tank
const generateData = () =>
  Array.from({ length: 100 }, (_, i) => ({
    id: `Tank ${String(i + 1).padStart(3, "0")}`,
    type: ["Diesel", "Pertalite", "Pertamax"][i % 3],
    site: `Site ${String.fromCharCode(65 + (i % 5))}`,
    status: ["Normal", "Warning", "Critical"][i % 3],
    fuelLevel: Math.floor(Math.random() * 8000),
    waterLevel: Math.floor(Math.random() * 1000),
    capacity: 8000,
    fuelPercentage: Math.floor(Math.random() * 100),
    waterPercentage: Math.floor(Math.random() * 10),
    totalPercentage: Math.floor(Math.random() * 100),
    lastUpdated: "Today, 10:45 AM",
    usageRate: ["Low", "Medium", "High"][i % 3],
    fuelColor: ["#16A34A", "#F59E0B", "#DC2626"][i % 3],
  }));

const FuelStock = () => {
  const data = generateData();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[16, 16]} justify="start">
        {paginatedData.map((item) => (
          <Col
            key={item.id}
            flex="0 0 300px"
            style={{ maxWidth: "300px" }}
          >
            <CCard className="shadow-sm h-full" style={{ height: "100%" }}>
              <CCardBody>
                <CCardTitle>{item.id}</CCardTitle>
                <CCardText>
                  <b>Type:</b> {item.type} <br />
                  <b>Site:</b> {item.site} <br />
                  <b>Status:</b>{" "}
                  <Tag
                    color={
                      item.status === "Normal"
                        ? "green"
                        : item.status === "Warning"
                        ? "orange"
                        : "red"
                    }
                  >
                    {item.status}
                  </Tag>
                  <br />
                  <b>Fuel Level:</b> {item.fuelLevel} L / {item.capacity} L
                  <Progress
                    percent={item.fuelPercentage}
                    strokeColor={item.fuelColor}
                    size="small"
                  />
                  <b>Water Level:</b> {item.waterLevel} L
                  <Progress
                    percent={item.waterPercentage}
                    strokeColor="#3B82F6"
                    size="small"
                  />
                  <b>Total:</b> {item.totalPercentage}%
                  <br />
                  <b>Usage:</b> {item.usageRate}
                  <br />
                  <small>{item.lastUpdated}</small>
                </CCardText>
              </CCardBody>
            </CCard>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={data.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default FuelStock;