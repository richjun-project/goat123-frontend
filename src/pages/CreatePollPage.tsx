import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Select, Space, Typography, Row, Col, Upload, message, Radio, Divider, Tag } from 'antd'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, UploadOutlined, PictureOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { pollService } from '../services/polls'
import { categories } from '../types'
import { supabase } from '../lib/supabase'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const CreatePollPage: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [pollType, setPollType] = useState<'versus' | 'multiple'>('versus')
  const [options, setOptions] = useState<Array<{ text: string; image?: File; imagePreview?: string }>>([
    { text: '' },
    { text: '' }
  ])
  const [loading, setLoading] = useState(false)

  const handlePollTypeChange = (type: 'versus' | 'multiple') => {
    setPollType(type)
    if (type === 'versus') {
      setOptions([{ text: '' }, { text: '' }])
    } else {
      setOptions([{ text: '' }, { text: '' }, { text: '' }])
    }
  }

  const addOption = () => {
    if (options.length >= 20) {
      message.warning('최대 20개까지 추가 가능합니다')
      return
    }
    setOptions([...options, { text: '' }])
  }

  const removeOption = (index: number) => {
    if (pollType === 'versus' || options.length <= 2) {
      message.warning('최소 2개의 선택지가 필요합니다')
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, field: 'text' | 'image' | 'imagePreview', value: string | File | null | undefined) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const handleSubmit = async (values: any) => {
    // 옵션 텍스트 검증
    const validOptions = options.filter(opt => opt.text.trim())
    if (validOptions.length < 2) {
      message.error('최소 2개의 선택지를 입력해주세요')
      return
    }

    setLoading(true)
    try {
      // 먼저 투표 생성
      const poll = await pollService.createPoll(
        values.title,
        values.description || '',
        pollType,
        values.category,
        validOptions.map(opt => ({ text: opt.text }))
      )
      
      // 이미지가 있는 옵션들에 대해 이미지 업로드
      const uploadPromises = validOptions.map(async (option, index) => {
        if (option.image) {
          const fileExt = option.image.name.split('.').pop()
          const fileName = `polls/${poll.id}/option_${index}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('poll-images')
            .upload(fileName, option.image)
          
          if (!uploadError) {
            const { data } = supabase.storage
              .from('poll-images')
              .getPublicUrl(fileName)
            
            // 옵션 이미지 URL 업데이트
            if (poll.options && poll.options[index]) {
              await supabase
                .from('poll_options')
                .update({ option_image: data.publicUrl })
                .eq('id', poll.options[index].id)
            }
          }
        }
      })
      
      await Promise.all(uploadPromises)
      
      message.success('투표가 생성되었습니다!')
      // navigate 전에 약간의 지연 추가
      setTimeout(() => {
        navigate(`/poll/${poll.id}`)
      }, 100)
    } catch (error: any) {
      message.error(error.message || '투표 생성에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 20 }}
      >
        뒤로 가기
      </Button>

      <Card>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 30 }}>
          새 투표 만들기
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: 'all',
            pollType: 'versus'
          }}
        >
          {/* 투표 유형 선택 */}
          <Form.Item label="투표 유형">
            <Radio.Group 
              value={pollType} 
              onChange={(e) => handlePollTypeChange(e.target.value)}
              size="large"
            >
              <Radio.Button value="versus">
                <Space>
                  ⚔️ VS 투표
                  <Tag color="blue">1:1 대결</Tag>
                </Space>
              </Radio.Button>
              <Radio.Button value="multiple">
                <Space>
                  🎯 다중 선택
                  <Tag color="green">여러 선택지</Tag>
                </Space>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* 기본 정보 */}
          <Form.Item
            name="title"
            label="투표 제목"
            rules={[
              { required: true, message: '제목을 입력해주세요' },
              { max: 100, message: '제목은 100자 이내로 입력해주세요' }
            ]}
          >
            <Input 
              size="large"
              placeholder={pollType === 'versus' 
                ? "예: 치킨 vs 피자" 
                : "예: 최애 K-POP 아이돌은?"
              }
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="설명 (선택)"
          >
            <TextArea 
              rows={3}
              placeholder="투표에 대한 설명을 입력해주세요"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="category"
            label="카테고리"
            rules={[{ required: true, message: '카테고리를 선택해주세요' }]}
          >
            <Select size="large">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          {/* 선택지 입력 */}
          <Form.Item label={pollType === 'versus' ? 'VS 선택지' : '투표 선택지'}>
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  style={{ marginBottom: 16 }}
                >
                  <Card size="small">
                    <Row gutter={16} align="middle">
                      <Col flex="auto">
                        <Input
                          size="large"
                          value={option.text}
                          onChange={(e) => updateOption(index, 'text', e.target.value)}
                          placeholder={
                            pollType === 'versus' 
                              ? index === 0 ? "첫 번째 선택지" : "두 번째 선택지"
                              : `선택지 ${index + 1}`
                          }
                          prefix={
                            <Text strong style={{ marginRight: 8 }}>
                              {pollType === 'versus' 
                                ? index === 0 ? 'A' : 'B'
                                : index + 1}
                            </Text>
                          }
                        />
                      </Col>
                      
                      {/* 이미지 업로드 (선택) */}
                      <Col>
                        <Upload
                          showUploadList={false}
                          beforeUpload={(file) => {
                            // 이미지 파일 검증
                            const isImage = file.type.startsWith('image/')
                            if (!isImage) {
                              message.error('이미지 파일만 업로드 가능합니다')
                              return false
                            }
                            const isLt5M = file.size / 1024 / 1024 < 5
                            if (!isLt5M) {
                              message.error('이미지는 5MB 이하여야 합니다')
                              return false
                            }
                            
                            // 이미지 미리보기 URL 생성
                            const reader = new FileReader()
                            reader.onload = (e) => {
                              updateOption(index, 'imagePreview', e.target?.result as string)
                            }
                            reader.readAsDataURL(file)
                            
                            updateOption(index, 'image', file)
                            message.success(`${file.name} 이미지가 선택되었습니다`)
                            return false
                          }}
                          accept="image/*"
                        >
                          <Button icon={option.image ? <PictureOutlined /> : <UploadOutlined />}>
                            {option.image ? option.image.name.substring(0, 10) + '...' : '이미지'}
                          </Button>
                        </Upload>
                      </Col>

                      {/* 삭제 버튼 */}
                      {pollType === 'multiple' && options.length > 2 && (
                        <Col>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeOption(index)}
                          />
                        </Col>
                      )}
                    </Row>
                    
                    {/* 이미지 미리보기 */}
                    {option.imagePreview && (
                      <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <img 
                          src={option.imagePreview} 
                          alt="미리보기" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: 200, 
                            borderRadius: 8,
                            border: '1px solid #f0f0f0'
                          }} 
                        />
                        <Button 
                          size="small" 
                          danger 
                          style={{ marginTop: 8 }}
                          onClick={() => {
                            updateOption(index, 'image', undefined)
                            updateOption(index, 'imagePreview', undefined)
                          }}
                        >
                          이미지 제거
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* 선택지 추가 버튼 */}
            {pollType === 'multiple' && options.length < 20 && (
              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={addOption}
                style={{ marginTop: 16 }}
              >
                선택지 추가 (최대 20개)
              </Button>
            )}
          </Form.Item>

          {/* 미리보기 */}
          <Card 
            title="미리보기" 
            style={{ marginBottom: 24 }}
            bodyStyle={{ background: '#fafafa' }}
          >
            <Title level={4} style={{ textAlign: 'center' }}>
              {form.getFieldValue('title') || '투표 제목'}
            </Title>
            
            {form.getFieldValue('description') && (
              <Paragraph type="secondary" style={{ textAlign: 'center' }}>
                {form.getFieldValue('description')}
              </Paragraph>
            )}
            
            <Row gutter={16} style={{ marginTop: 20 }}>
              {options.map((option, index) => (
                option.text && (
                  <Col 
                    key={index} 
                    span={pollType === 'versus' ? 12 : 24}
                    style={{ marginBottom: 8 }}
                  >
                    <Card size="small">
                      <Text>{option.text}</Text>
                    </Card>
                  </Col>
                )
              ))}
            </Row>
          </Card>

          {/* 제출 버튼 */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              투표 생성하기
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CreatePollPage