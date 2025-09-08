import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Select, Upload, Button, Card, Row, Col, Typography, Space, message, Divider } from 'antd'
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { categories } from '../types'
import { s3Service } from '../services/s3Upload'
import { supabase } from '../lib/supabase'

const { Title, Text } = Typography
const { TextArea } = Input

interface BattleFormData {
  title: string
  category: string
  option_a: string
  option_b: string
  description?: string
}

const CreateBattlePage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileListA, setFileListA] = useState<UploadFile[]>([])
  const [fileListB, setFileListB] = useState<UploadFile[]>([])

  const handleSubmit = async (values: BattleFormData) => {
    try {
      setLoading(true)

      // 1. 배틀 생성
      const { data: battle, error } = await supabase
        .from('battles')
        .insert({
          title: values.title,
          category: values.category,
          option_a: values.option_a,
          option_b: values.option_b,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // 2. 이미지 업로드 (있는 경우)
      if (fileListA[0]?.originFileObj) {
        const imageUrlA = await s3Service.uploadImage(
          fileListA[0].originFileObj as File,
          battle.id,
          'A'
        )
        await supabase
          .from('battles')
          .update({ option_a_image: imageUrlA })
          .eq('id', battle.id)
      }

      if (fileListB[0]?.originFileObj) {
        const imageUrlB = await s3Service.uploadImage(
          fileListB[0].originFileObj as File,
          battle.id,
          'B'
        )
        await supabase
          .from('battles')
          .update({ option_b_image: imageUrlB })
          .eq('id', battle.id)
      }

      message.success('배틀이 생성되었습니다!')
      navigate(`/battle/${battle.id}`)
    } catch (error: any) {
      console.error('Error creating battle:', error)
      message.error(error.message || '배틀 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const validation = s3Service.validateImage(file)
      if (!validation.valid) {
        message.error(validation.error)
        return false
      }
      return false // 자동 업로드 방지
    },
    maxCount: 1,
    listType: 'picture-card',
    accept: 'image/*'
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/')}
        type="text"
      >
        뒤로가기
      </Button>

      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          새로운 배틀 만들기
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 800, margin: '0 auto' }}
        >
          <Form.Item
            name="title"
            label="배틀 제목"
            rules={[
              { required: true, message: '배틀 제목을 입력해주세요' },
              { min: 5, message: '최소 5자 이상 입력해주세요' },
              { max: 50, message: '최대 50자까지 입력 가능합니다' }
            ]}
          >
            <Input 
              placeholder="예: 최고의 라면은?" 
              size="large"
              showCount
              maxLength={50}
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
          >
            <Select 
              placeholder="카테고리 선택" 
              size="large"
              options={categories
                .filter(c => c.id !== 'all')
                .map(c => ({
                  label: <Space>{c.icon} {c.name}</Space>,
                  value: c.id
                }))}
            />
          </Form.Item>

          <Divider>선택지 설정</Divider>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Card style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                <Form.Item
                  name="option_a"
                  label="선택지 A"
                  rules={[
                    { required: true, message: '선택지 A를 입력해주세요' },
                    { max: 30, message: '최대 30자까지 입력 가능합니다' }
                  ]}
                >
                  <Input 
                    placeholder="예: 신라면" 
                    size="large"
                    showCount
                    maxLength={30}
                  />
                </Form.Item>

                <Form.Item label="선택지 A 이미지 (선택)">
                  <Upload
                    {...uploadProps}
                    fileList={fileListA}
                    onChange={({ fileList }) => setFileListA(fileList)}
                  >
                    {fileListA.length === 0 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>이미지 업로드</div>
                      </div>
                    )}
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    JPG, PNG, WebP, GIF (최대 5MB)
                  </Text>
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} md={12}>
              <Card style={{ background: '#fff1f0', border: '1px solid #ffccc7' }}>
                <Form.Item
                  name="option_b"
                  label="선택지 B"
                  rules={[
                    { required: true, message: '선택지 B를 입력해주세요' },
                    { max: 30, message: '최대 30자까지 입력 가능합니다' }
                  ]}
                >
                  <Input 
                    placeholder="예: 진라면" 
                    size="large"
                    showCount
                    maxLength={30}
                  />
                </Form.Item>

                <Form.Item label="선택지 B 이미지 (선택)">
                  <Upload
                    {...uploadProps}
                    fileList={fileListB}
                    onChange={({ fileList }) => setFileListB(fileList)}
                  >
                    {fileListB.length === 0 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>이미지 업로드</div>
                      </div>
                    )}
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    JPG, PNG, WebP, GIF (최대 5MB)
                  </Text>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="설명 (선택)"
          >
            <TextArea 
              placeholder="배틀에 대한 추가 설명을 입력해주세요" 
              rows={3}
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 32 }}>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                size="large" 
                onClick={() => navigate('/')}
              >
                취소
              </Button>
              <Button 
                type="primary" 
                size="large" 
                htmlType="submit"
                loading={loading}
                icon={<PlusOutlined />}
              >
                배틀 생성하기
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Space>
  )
}

export default CreateBattlePage