import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Space, Modal, Form, message,
  Popconfirm, Switch, Card, Row, Col,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getHotelList, createHotel, updateHotel, deleteHotel } from '../../api/hotel';

const Hotels = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getHotelList({ page, pageSize, keyword });
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
  }, [page, pageSize, keyword]);

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateHotel(editingRecord.id, values);
        message.success('更新成功');
      } else {
        await createHotel(values);
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
      await deleteHotel(id);
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
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '民宿名称', dataIndex: 'name', width: 150 },
    { title: '地址', dataIndex: 'address', width: 200, ellipsis: true },
    { title: '联系电话', dataIndex: 'phone', width: 120 },
    { title: '星级', dataIndex: 'starLevel', width: 80 },
    { title: '状态', dataIndex: 'status', width: 100,
      render: (v) => <Switch checked={v === 1} disabled /> },
    {
      title: '操作', width: 200,
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
              placeholder="搜索民宿名称/地址"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onSearch={() => { setPage(1); loadData(); }}
              style={{ width: 300 }}
            />
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
              新增民宿
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
        title={editingRecord ? '编辑民宿' : '新增民宿'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); form.resetFields(); }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="民宿名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="starLevel" label="星级">
            <Input placeholder="如：三星、四星、五星" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Switch checkedChildren="营业" unCheckedChildren="停业" />
          </Form.Item>
          <Form.Item name="description" label="简介">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Hotels;
