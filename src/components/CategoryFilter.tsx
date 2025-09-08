import React from 'react'
import { Space, Tag } from 'antd'
import { categories } from '../types'

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  selectedCategory, 
  onCategoryChange 
}) => {
  return (
    <Space wrap style={{ marginBottom: 24 }}>
      {categories.map(category => (
        <Tag
          key={category.id}
          color={selectedCategory === category.id ? category.color : 'default'}
          style={{ 
            cursor: 'pointer',
            fontSize: 14,
            padding: '4px 12px',
            borderRadius: 16,
            transition: 'all 0.3s'
          }}
          onClick={() => onCategoryChange(category.id)}
        >
          <Space size={4}>
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </Space>
        </Tag>
      ))}
    </Space>
  )
}

export default CategoryFilter