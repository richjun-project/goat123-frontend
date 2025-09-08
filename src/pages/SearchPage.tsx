import React, { useState, useEffect } from 'react'
import { Input, Card, Row, Col, Select, Tag, Space, Typography, Empty, Spin, Button } from 'antd'
import { SearchOutlined, FilterOutlined, FireOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PollCard from '../components/PollCard'
import type { Poll } from '../types'
import { motion } from 'framer-motion'

const { Search } = Input
const { Option } = Select
const { Title, Text } = Typography

const SearchPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<Poll[]>([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>('all')
  const [pollType, setPollType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularTags] = useState([
    'BLACKPINK', '뉴진스', 'K-pop', '2025 트렌드', 
    'MZ세대', '패션', '음식', '연애', '직장생활',
    'AI', '여행', '운동', '게임', '영화'
  ])

  useEffect(() => {
    // 최근 검색어 불러오기
    const saved = JSON.parse(localStorage.getItem('recentSearches') || '[]')
    setRecentSearches(saved)

    // URL 파라미터에 검색어가 있으면 검색 실행
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [])

  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery
    
    if (!searchTerm.trim()) return

    setLoading(true)
    try {
      let queryBuilder = supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*)
        `)

      // 검색어 필터링 - title, description, category에서 검색
      queryBuilder = queryBuilder.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`
      )

      // 카테고리 필터
      if (category !== 'all') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      // 투표 타입 필터
      if (pollType !== 'all') {
        queryBuilder = queryBuilder.eq('poll_type', pollType)
      }

      // 정렬
      switch (sortBy) {
        case 'recent':
          queryBuilder = queryBuilder.order('created_at', { ascending: false })
          break
        case 'popular':
          queryBuilder = queryBuilder.order('total_votes', { ascending: false })
          break
        case 'views':
          queryBuilder = queryBuilder.order('view_count', { ascending: false })
          break
        default: // relevance - 최신순으로 기본 정렬
          queryBuilder = queryBuilder.order('created_at', { ascending: false })
      }

      const { data, error } = await queryBuilder

      if (error) throw error

      setResults(data || [])

      // 최근 검색어 저장 (중복 제거, 최대 10개)
      if (searchTerm && !recentSearches.includes(searchTerm)) {
        const updated = [searchTerm, ...recentSearches].slice(0, 10)
        setRecentSearches(updated)
        localStorage.setItem('recentSearches', JSON.stringify(updated))
      }

      // URL 파라미터 업데이트
      setSearchParams({ q: searchTerm })
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag)
    handleSearch(tag)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      {/* 검색 헤더 */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 20 }}>
          <SearchOutlined /> 투표 검색
        </Title>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 검색 바 */}
          <Search
            placeholder="투표 제목, 설명, 카테고리로 검색..."
            enterButton="검색"
            size="large"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={() => handleSearch()}
            loading={loading}
            prefix={<SearchOutlined />}
          />

          {/* 필터 옵션 */}
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="카테고리"
                value={category}
                onChange={setCategory}
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">모든 카테고리</Option>
                <Option value="entertainment">엔터테인먼트</Option>
                <Option value="lifestyle">라이프스타일</Option>
                <Option value="food">음식</Option>
                <Option value="sports">스포츠</Option>
                <Option value="tech">테크</Option>
                <Option value="fashion">패션</Option>
                <Option value="travel">여행</Option>
                <Option value="other">기타</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="투표 유형"
                value={pollType}
                onChange={setPollType}
              >
                <Option value="all">모든 유형</Option>
                <Option value="versus">VS 투표</Option>
                <Option value="multiple">다중 선택</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                style={{ width: '100%' }}
                placeholder="정렬 기준"
                value={sortBy}
                onChange={setSortBy}
              >
                <Option value="relevance">관련도순</Option>
                <Option value="recent">최신순</Option>
                <Option value="popular">인기순</Option>
                <Option value="views">조회순</Option>
              </Select>
            </Col>
          </Row>

          {/* 인기 태그 */}
          <div>
            <Text type="secondary" style={{ marginRight: 12 }}>인기 검색어:</Text>
            <Space wrap>
              {popularTags.map(tag => (
                <Tag
                  key={tag}
                  color="blue"
                  style={{ cursor: 'pointer', marginBottom: 8 }}
                  onClick={() => handleTagClick(tag)}
                  icon={tag === 'BLACKPINK' || tag === '뉴진스' ? <FireOutlined /> : null}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>

          {/* 최근 검색어 */}
          {recentSearches.length > 0 && (
            <div>
              <Space style={{ marginBottom: 8 }}>
                <Text type="secondary">최근 검색:</Text>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={clearRecentSearches}
                  style={{ padding: 0 }}
                >
                  모두 지우기
                </Button>
              </Space>
              <br />
              <Space wrap>
                {recentSearches.map(search => (
                  <Tag
                    key={search}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTagClick(search)}
                    closable
                    onClose={(e) => {
                      e.preventDefault()
                      const updated = recentSearches.filter(s => s !== search)
                      setRecentSearches(updated)
                      localStorage.setItem('recentSearches', JSON.stringify(updated))
                    }}
                  >
                    {search}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </Space>
      </Card>

      {/* 검색 결과 */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : results.length > 0 ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text strong>{results.length}개</Text>의 검색 결과
          </div>
          <Row gutter={[16, 16]}>
            {results.map((poll, index) => (
              <Col xs={24} sm={12} lg={8} key={poll.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PollCard poll={poll} index={index} />
                </motion.div>
              </Col>
            ))}
          </Row>
        </>
      ) : searchQuery ? (
        <Card>
          <Empty
            description={
              <Space direction="vertical">
                <Text>'{searchQuery}'에 대한 검색 결과가 없습니다</Text>
                <Text type="secondary">다른 검색어를 시도해보세요</Text>
              </Space>
            }
          />
        </Card>
      ) : (
        <Card>
          <Empty
            image={<SearchOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <Space direction="vertical">
                <Text>검색어를 입력하거나 인기 태그를 클릭해보세요</Text>
                <Button 
                  type="primary" 
                  onClick={() => handleTagClick('BLACKPINK')}
                  icon={<FireOutlined />}
                >
                  BLACKPINK 투표 보기
                </Button>
              </Space>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default SearchPage