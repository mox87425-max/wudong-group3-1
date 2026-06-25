import React, { useState, useEffect } from 'react';
import {
  Card, Select, DatePicker, Table, Button, InputNumber,
  message, Form, Modal, Row, Col, Tag,
} from 'antd';
import dayjs from 'dayjs';
import { getRoomList, getRoomCalendar, updateRoomCalendar } from '../../api/hotel';

const { RangePicker } = DatePicker;

const Calendar = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [yearMonth, setYearMonth] = useState(dayjs().format('YYYY-MM'));
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [form] = Form.useForm();

  const loadRooms = async () => {
    try {
      const res = await getRoomList({ page: 1, pageSize: 100 });
      setRooms(res.list || []);
      if (res.list?.length > 0) {
        setSelectedRoomId(res.list[0].id);
      }
    } catch (error) {
      message.error('加载房型列表失败');
    }
  };

  const loadCalendar = async () => {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      const res = await getRoomCalendar(selectedRoomId, yearMonth);
      setCalendarData(res || []);
    } catch (error) {
      message.error('加载日历数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadCalendar();
    }
  }, [selectedRoomId, yearMonth]);

  const handleEditDay = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      date: record.date,
      stock: record.stock,
      price: record.price,
    });
    setEditModalVisible(true);
  };

  const handleSaveDay = async (values) => {
    try {
      await updateRoomCalendar(selectedRoomId, {
        date: values.date,
        stock: values.stock,
        price: values.price,
      });
      message.success('更新成功');
      setEditModalVisible(false);
      loadCalendar();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleBatchSet = async (values) => {
    try {
      const [startDate, endDate] = values.dateRange;
      const days = [];
      let current = startDate;
      while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
        days.push(current.format('YYYY-MM-DD'));
        current = current.add(1, 'day');
      }
      for (const date of days) {
        await updateRoomCalendar(selectedRoomId, {
          date,
          stock: values.stock,
          price: values.price,
        });
      }
      message.success(`已更新 ${days.length} 天的数据`);
      loadCalendar();
      setEditModalVisible(false);
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  const columns = [
    { title: '日期', dataIndex: 'date', width: 120 },
    { title: '星期', dataIndex: 'weekday', width: 80 },
    { title: '库存', dataIndex: 'stock', width: 80, render: (v) => v === undefined ? '-' : v },
    { title: '价格(¥)', dataIndex: 'price', width: 100, render: (v) => v ? `¥${v}` : '-' },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v) => {
        if (v === 1) return <Tag color="green">可订</Tag>;
        if (v === 0) return <Tag color="red">满房</Tag>;
        return <Tag color="orange">维护</Tag>;
      }
    },
    {
      title: '操作', width: 100,
      render: (_, record) => (
        <Button size="small" onClick={() => handleEditDay(record)}>设置</Button>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              style={{ width: 200 }}
              placeholder="选择房型"
              value={selectedRoomId}
              onChange={setSelectedRoomId}
            >
              {rooms.map(r => (
                <Select.Option key={r.id} value={r.id}>
                  {r.hotelName} - {r.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col>
            <DatePicker
              picker="month"
              value={dayjs(yearMonth)}
              onChange={(v) => setYearMonth(v?.format('YYYY-MM') || dayjs().format('YYYY-MM'))}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={() => { setEditRecord(null); setEditModalVisible(true); }}>
              批量设置
            </Button>
          </Col>
        </Row>
        <Table
          rowKey="date"
          columns={columns}
          dataSource={calendarData}
          loading={loading}
          pagination={false}
          bordered
        />
      </Card>

      <Modal
        title={editRecord ? '设置日库存与价格' : '批量设置库存与价格'}
        open={editModalVisible}
        onCancel={() => { setEditModalVisible(false); setEditRecord(null); form.resetFields(); }}
        footer={null}
      >
        {editRecord ? (
          <Form form={form} onFinish={handleSaveDay} layout="vertical">
            <Form.Item name="date" label="日期">
              <Input disabled />
            </Form.Item>
            <Form.Item name="stock" label="库存数量">
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="price" label="价格(¥)">
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>保存</Button>
            </Form.Item>
          </Form>
        ) : (
          <Form onFinish={handleBatchSet} layout="vertical">
            <Form.Item name="dateRange" label="日期范围" rules={[{ required: true }]}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="stock" label="库存数量" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} />
            </Form.Item>
            <Form.Item name="price" label="价格(¥)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={0} precision={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>批量保存</Button>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default Calendar;
