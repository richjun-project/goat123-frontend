import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Space, Progress, Tabs } from 'antd'
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Battle } from '../types'

const { Title, Text } = Typography
const { TabPane } = Tabs

interface RealtimeDashboardProps {
  battle: Battle
}

const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({ battle }) => {
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([])
  const [regionData, setRegionData] = useState<any[]>([])
  const [ageData, setAgeData] = useState<any[]>([])
  const [genderData, setGenderData] = useState<any[]>([])

  useEffect(() => {
    // 시계열 데이터 생성
    const times = ['6시간 전', '5시간 전', '4시간 전', '3시간 전', '2시간 전', '1시간 전', '현재']
    const series = times.map((time) => ({
      time,
      [battle.option_a]: Math.floor(Math.random() * 10) + 45,
      [battle.option_b]: Math.floor(Math.random() * 10) + 45,
    }))
    setTimeSeriesData(series)

    // 지역별 데이터
    const regions = [
      { name: '서울', [battle.option_a]: 52, [battle.option_b]: 48 },
      { name: '부산', [battle.option_a]: 45, [battle.option_b]: 55 },
      { name: '대구', [battle.option_a]: 49, [battle.option_b]: 51 },
      { name: '인천', [battle.option_a]: 53, [battle.option_b]: 47 },
      { name: '대전', [battle.option_a]: 48, [battle.option_b]: 52 },
      { name: '광주', [battle.option_a]: 51, [battle.option_b]: 49 },
    ]
    setRegionData(regions)

    // 연령대별 데이터
    const ages = [
      { age: '10대', [battle.option_a]: 45, [battle.option_b]: 55 },
      { age: '20대', [battle.option_a]: 52, [battle.option_b]: 48 },
      { age: '30대', [battle.option_a]: 49, [battle.option_b]: 51 },
      { age: '40대', [battle.option_a]: 53, [battle.option_b]: 47 },
      { age: '50대+', [battle.option_a]: 47, [battle.option_b]: 53 },
    ]
    setAgeData(ages)

    // 성별 데이터
    const gender = [
      { name: '남성', value: 52, fill: '#1890ff' },
      { name: '여성', value: 48, fill: '#ff85c0' },
    ]
    setGenderData(gender)
  }, [battle])


  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={3}>📊 실시간 투표 분석</Title>

      <Tabs defaultActiveKey="1">
        <TabPane tab="시간대별 추이" key="1">
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={battle.option_a} 
                  stackId="1" 
                  stroke="#52c41a" 
                  fill="#52c41a" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey={battle.option_b} 
                  stackId="1" 
                  stroke="#ff4d4f" 
                  fill="#ff4d4f" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab="지역별 분포" key="2">
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={battle.option_a} fill="#52c41a" />
                <Bar dataKey={battle.option_b} fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {regionData.map(region => (
                <Col span={8} key={region.name}>
                  <Text strong>{region.name}</Text>
                  <Progress 
                    percent={100}
                    success={{ 
                      percent: (region[battle.option_b] / (region[battle.option_a] + region[battle.option_b])) * 100 
                    }}
                    format={() => `${region[battle.option_a]}% vs ${region[battle.option_b]}%`}
                    strokeColor="#52c41a"
                    trailColor="#ff4d4f"
                  />
                </Col>
              ))}
            </Row>
          </Card>
        </TabPane>

        <TabPane tab="연령대별 분포" key="3">
          <Card>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={battle.option_a} fill="#52c41a" />
                <Bar dataKey={battle.option_b} fill="#ff4d4f" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        <TabPane tab="성별 분포" key="4">
          <Card>
            <Row gutter={32}>
              <Col span={12}>
                <Title level={5}>{battle.option_a} 선택자 성별</Title>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
              <Col span={12}>
                <Title level={5}>{battle.option_b} 선택자 성별</Title>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '남성', value: 48, fill: '#1890ff' },
                        { name: '여성', value: 52, fill: '#ff85c0' },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} ${entry.value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>

      <Card title="투표 참여 유도">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text type="warning">⚡ 지금 투표하면 역전 가능!</Text>
          <Text>현재 {Math.abs(battle.votes_a - battle.votes_b)}표 차이로 접전 중입니다.</Text>
          <Text type="secondary">매 시간 투표 현황이 업데이트됩니다.</Text>
        </Space>
      </Card>
    </Space>
  )
}

export default RealtimeDashboard