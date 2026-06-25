import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, message } from 'antd';
import { HomeOutlined, ApartmentOutlined, CalendarOutlined } from '@ant-design/icons';
import { getHotelList, getRoomList } from '../../api/hotel';

const Dashboard = () => {
  const [stats, setStats] = useState({ hotelCount: 0, roomCount: 0 });
  const [recentHotels, setRecentHotels] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [hotels, rooms] = await Promise.all([
          getHotelList({ page: 1, pageSize: 1 }),
          getRoomList({ page: 1, pageSize: 1 }),
        ]);
        const hotelList = await getHotelList({ page: 1, pageSize: 10 });
        setStats({
          hotelCount: hotels.total || 0,
          roomCount: rooms.total || 0,
        });
        setRecentHotels(hotelList.list || []);
      } catch (error) {
        message.error('加载统计数据失败');
      }
    };
    loadStats();
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '名称', dataIndex: 'name' },
    { title: '地址', dataIndex: 'address', ellipsis: true },
    { title: '星级', dataIndex: 'starLevel', width: 80 },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card><Statistic title="民宿总数" value={stats.hotelCount} prefix={<HomeOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="房型总数" value={stats.roomCount} prefix={<ApartmentOutlined />} /></Card>
        </Col>
        <Col span={8}>
          <Card><Statistic title="房态管理" value="进行中" prefix={<CalendarOutlined />} /></Card>
        </Col>
      </Row>
      <Card title="最近民宿">
        <Table rowKey="id" columns={columns} dataSource={recentHotels} pagination={false} />
      </Card>
    </div>
  );
};

export default Dashboard;
