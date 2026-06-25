import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Modal, Form, message,
  Popconfirm, Select, Card, Row, Col, InputNumber,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getRoomList, createRoom, updateRoom, deleteRoom, getHotelList } from '../../api/hotel';

const { Option } = Select;

const Rooms = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [hotelOptions, setHotelOptions] = useState([]);
  const [form] = Form.useForm();

  const loadHotels = async () => {
    try {
      const res = await getHotelList({ page: 1, pageSize: 100 });
      setHotelOptions(res.list || []);
    } catch (error) {
      console.error('加载民宿列表失败');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getRoomList({ page, pageSize, keyword });
      setDataSource(res.list || []);
      setTotal(res.total || 0);
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadHotels();
  }, [page, pageSize, keyword]);

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateRoom(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createRoom(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRoom(id);
      message.success('删除成功');
      loadData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openModal = (record = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue(record);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '房型名称', dataIndex: 'name', width: 120 },
    { title: '所属民宿', dataIndex: 'hotelName', width: 120 },
    { title: '面积(㎡)', dataIndex: 'area', width: 80 },
    { title: '床型', dataIndex: 'bedType', width: 100 },
    { title: '最大入住', dataIndex: 'maxOccupancy', width: 80 },
    { title: '数量', dataIndex: 'quantity', width: 60 },
    { title: '价格(¥)', dataIndex: 'price', width: 80, render: (v) => `¥${v}` },
    {
      title: '操作', width: 150,
      render: (_, record) => (
        <Space>
          <Button size="small" onClick={() => openModal(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col flex="auto">
            <Input.Search
              placeholder="搜索房型名称"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => { setPage(1); loadData(); }}
              style={{ width: 250 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增房型
            </Button>
          </Col>
        </Row>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
        />
      </Card>
      <Modal
        title={editingRecord ? '编辑房型' : '新增房型'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="hotelId" label="所属民宿" rules={[{ required: true }]}>
            <Select placeholder="选择民宿">
              {hotelOptions.map(h => (
                <Option key={h.id} value={h.id}>{h.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="name" label="房型名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="area" label="面积(㎡)">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="bedType" label="床型">
            <Input placeholder="如：大床房、双床房" />
          </Form.Item>
          <Form.Item name="maxOccupancy" label="最大入住人数">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="quantity" label="房间数量" initialValue={1}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="price" label="价格(¥)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Rooms;
