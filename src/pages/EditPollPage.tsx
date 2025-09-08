import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Form, Input, Button, Select, Space, Typography, Row, Col, Upload, message, Radio, Divider, Tag, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined, UploadOutlined, PictureOutlined, LoadingOutlined } from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { categories } from '../types'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Poll, PollOption } from '../types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

interface EditOption {
  id?: string
  text: string
  image?: File
  imageUrl?: string
  imagePreview?: string
  isNew?: boolean
  isDeleted?: boolean
}

interface PollWithOptions extends Poll {
  poll_options?: PollOption[]
}

const EditPollPage: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [poll, setPoll] = useState<PollWithOptions | null>(null)
  const [pollType, setPollType] = useState<'versus' | 'multiple'>('versus')
  const [options, setOptions] = useState<EditOption[]>([])

  useEffect(() => {
    fetchPoll()
  }, [id])

  const fetchPoll = async () => {
    if (!id || !user) return

    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          poll_options(*)
        `)
        .eq('id', id)
        .eq('created_by', user.id)
        .single()

      if (pollError || !pollData) {
        console.error('Poll fetch error:', pollError)
        message.error('투표를 찾을 수 없거나 권한이 없습니다')
        navigate('/')
        return
      }

      console.log('Fetched poll data:', pollData)
      
      setPoll(pollData)
      setPollType(pollData.poll_type)
      
      // Set form values
      form.setFieldsValue({
        title: pollData.title,
        description: pollData.description,
        category: pollData.category,
        pollType: pollData.poll_type
      })

      // Set options - poll_options is the correct field name
      const existingOptions: EditOption[] = pollData.poll_options
        ?.sort((a: PollOption, b: PollOption) => a.display_order - b.display_order)
        .map((opt: PollOption) => ({
          id: opt.id,
          text: opt.option_text,
          imageUrl: opt.option_image
        })) || []
      
      console.log('Loaded options from DB:', existingOptions)

      // Ensure at least 2 options for versus, 3 for multiple
      while (existingOptions.length < (pollData.poll_type === 'versus' ? 2 : 3)) {
        existingOptions.push({ text: '', isNew: true })
      }
      
      console.log('Final options after ensuring minimum:', existingOptions)
      setOptions(existingOptions)
    } catch (error) {
      message.error('투표 정보를 불러오는데 실패했습니다')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handlePollTypeChange = (type: 'versus' | 'multiple') => {
    // Poll type cannot be changed after creation
    message.warning('투표 유형은 변경할 수 없습니다')
  }

  const addOption = () => {
    if (options.length >= 20) {
      message.warning('최대 20개까지 추가 가능합니다')
      return
    }
    setOptions([...options, { text: '', isNew: true }])
  }

  const removeOption = (index: number) => {
    const activeOptions = options.filter(o => !o.isDeleted)
    if (pollType === 'versus' || activeOptions.length <= 2) {
      message.warning('최소 2개의 선택지가 필요합니다')
      return
    }
    
    const newOptions = [...options]
    if (newOptions[index].id && !newOptions[index].isNew) {
      // Mark existing option as deleted
      newOptions[index].isDeleted = true
    } else {
      // Remove new option completely
      newOptions.splice(index, 1)
    }
    setOptions(newOptions)
  }

  const updateOption = (index: number, field: string, value: any) => {
    console.log(`Updating option ${index}, field: ${field}, value:`, value)
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    console.log('Updated options:', newOptions)
    setOptions(newOptions)
  }

  const handleSubmit = async (values: any) => {
    console.log('handleSubmit called with:', values)
    console.log('Current options:', options)
    console.log('Options detail:', JSON.stringify(options, null, 2))
    
    // Validate options
    const activeOptions = options.filter(opt => !opt.isDeleted && opt.text && opt.text.trim())
    console.log('Active options:', activeOptions)
    console.log('Active options detail:', JSON.stringify(activeOptions, null, 2))
    
    if (activeOptions.length < 2) {
      message.error('최소 2개의 선택지를 입력해주세요')
      return
    }

    setSaving(true)
    try {
      // Update poll basic info
      console.log('Updating poll with ID:', id)
      const { error: updateError } = await supabase
        .from('polls')
        .update({
          title: values.title,
          description: values.description || '',
          category: values.category,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('created_by', user?.id)

      if (updateError) {
        console.error('Poll update error:', updateError)
        throw updateError
      }
      console.log('Poll basic info updated successfully')

      // Handle option updates
      console.log('Processing options...')
      for (let i = 0; i < options.length; i++) {
        const option = options[i]
        console.log(`Processing option ${i}:`, option)
        
        if (option.isDeleted && option.id) {
          // Delete option
          console.log(`Deleting option ${option.id}`)
          const { error: deleteError } = await supabase
            .from('poll_options')
            .delete()
            .eq('id', option.id)
          
          if (deleteError) {
            console.error(`Failed to delete option ${option.id}:`, deleteError)
            throw deleteError
          }
        } else if (option.isNew && option.text.trim()) {
          // Create new option
          console.log(`Creating new option: ${option.text}`)
          const { data: newOption, error: createError } = await supabase
            .from('poll_options')
            .insert({
              poll_id: id,
              option_text: option.text,
              display_order: i,
              vote_count: 0
            })
            .select()
            .single()

          if (createError) {
            console.error('Failed to create option:', createError)
            throw createError
          }
          console.log('Created new option:', newOption)

          // Upload image if exists
          if (option.image && newOption) {
            const fileExt = option.image.name.split('.').pop()
            const fileName = `polls/${id}/option_${newOption.id}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
              .from('poll-images')
              .upload(fileName, option.image, { upsert: true })
            
            if (!uploadError) {
              const { data } = supabase.storage
                .from('poll-images')
                .getPublicUrl(fileName)
              
              await supabase
                .from('poll_options')
                .update({ option_image: data.publicUrl })
                .eq('id', newOption.id)
            }
          }
        } else if (option.id && option.text.trim()) {
          // Update existing option
          console.log(`Updating existing option ${option.id}: ${option.text}`)
          const { error: updateOptError } = await supabase
            .from('poll_options')
            .update({
              option_text: option.text,
              display_order: i
            })
            .eq('id', option.id)
          
          if (updateOptError) {
            console.error(`Failed to update option ${option.id}:`, updateOptError)
            throw updateOptError
          }

          // Handle image update
          if (option.image) {
            const fileExt = option.image.name.split('.').pop()
            const fileName = `polls/${id}/option_${option.id}.${fileExt}`
            
            const { error: uploadError } = await supabase.storage
              .from('poll-images')
              .upload(fileName, option.image, { upsert: true })
            
            if (!uploadError) {
              const { data } = supabase.storage
                .from('poll-images')
                .getPublicUrl(fileName)
              
              await supabase
                .from('poll_options')
                .update({ option_image: data.publicUrl })
                .eq('id', option.id)
            }
          }
        }
      }

      console.log('All options processed successfully')
      message.success('투표가 수정되었습니다!')
      navigate(`/poll/${id}`)
    } catch (error: any) {
      console.error('Error during poll update:', error)
      message.error(error.message || '투표 수정에 실패했습니다')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </div>
    )
  }

  if (!poll) {
    return null
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
          투표 수정하기
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* 투표 유형 표시 (수정 불가) */}
          <Form.Item label="투표 유형">
            <Radio.Group 
              value={pollType} 
              disabled
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
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">투표 유형은 변경할 수 없습니다</Text>
            </div>
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
                !option.isDeleted && (
                  <motion.div
                    key={option.id || `new-${index}`}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2 }}
                    style={{ marginBottom: 16 }}
                  >
                    <Card size="small" style={{ opacity: option.isDeleted ? 0.5 : 1 }}>
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
                            disabled={option.isDeleted}
                          />
                          {option.isNew && (
                            <Tag color="green" style={{ marginLeft: 8 }}>새 선택지</Tag>
                          )}
                        </Col>
                        
                        {/* 이미지 업로드 (선택) */}
                        <Col>
                          <Upload
                            showUploadList={false}
                            beforeUpload={(file) => {
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
                            disabled={option.isDeleted}
                          >
                            <Button 
                              icon={option.image || option.imageUrl ? <PictureOutlined /> : <UploadOutlined />}
                              disabled={option.isDeleted}
                            >
                              {option.image ? option.image.name.substring(0, 10) + '...' : 
                               option.imageUrl ? '이미지 변경' : '이미지'}
                            </Button>
                          </Upload>
                        </Col>

                        {/* 삭제 버튼 */}
                        {pollType === 'multiple' && options.filter(o => !o.isDeleted).length > 2 && (
                          <Col>
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeOption(index)}
                              disabled={option.isDeleted}
                            />
                          </Col>
                        )}
                      </Row>
                      
                      {/* 이미지 미리보기 */}
                      {(option.imagePreview || option.imageUrl) && !option.isDeleted && (
                        <div style={{ marginTop: 12, textAlign: 'center' }}>
                          <img 
                            src={option.imagePreview || option.imageUrl} 
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
                              updateOption(index, 'image', null)
                              updateOption(index, 'imagePreview', null)
                              updateOption(index, 'imageUrl', null)
                            }}
                          >
                            이미지 제거
                          </Button>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              ))}
            </AnimatePresence>

            {/* 선택지 추가 버튼 */}
            {pollType === 'multiple' && options.filter(o => !o.isDeleted).length < 20 && (
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
              {options.filter(o => !o.isDeleted).map((option, index) => (
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
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={saving}
                style={{ minWidth: 120 }}
              >
                수정 완료
              </Button>
              <Button
                size="large"
                onClick={() => navigate(`/poll/${id}`)}
                style={{ minWidth: 120 }}
              >
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default EditPollPage