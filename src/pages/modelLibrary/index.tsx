import React, { useState, useEffect } from 'react';
import { Input, Card, Button, Space, message, Spin } from 'antd';
import { history } from 'umi';
import { SearchOutlined, EyeOutlined, DownloadOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import './index.less';
import { Row, Col } from 'antd';

// 定义模型数据接口
interface ModelItem {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  fileSize: string;
  downloadCount: number;
}

// 模拟模型数据
const mockModels: ModelItem[] = [
  {
    id: '1',
    name: '机械臂关节模型',
    imageUrl: require('@/assets/library/1.jpg'),
    description: '高精度机械臂关节3D打印模型',
    category: '机械零件',
    fileSize: '2.4MB',
    downloadCount: 128
  },
  {
    id: '2',
    name: '无人机外壳',
    imageUrl: require('@/assets/library/2.jpg'),
    description: '轻量化无人机外壳设计',
    category: '电子产品',
    fileSize: '3.7MB',
    downloadCount: 95
  },
  {
    id: '3',
    name: '齿轮组件',
    imageUrl: require('@/assets/library/3.jpg'),
    description: '高精度齿轮传动组件',
    category: '机械零件',
    fileSize: '1.8MB',
    downloadCount: 210
  },
  {
    id: '4',
    name: '手机支架',
    imageUrl: require('@/assets/library/4.jpg'),
    description: '可调节角度手机支架',
    category: '生活用品',
    fileSize: '1.2MB',
    downloadCount: 342
  },
  {
    id: '5',
    name: '机器人头部',
    imageUrl: require('@/assets/library/5.jpg'),
    description: '人形机器人头部结构',
    category: '机器人',
    fileSize: '4.2MB',
    downloadCount: 87
  },
  {
    id: '6',
    name: '水杯模型',
    imageUrl: require('@/assets/library/6.jpg'),
    description: '创意水杯设计',
    category: '生活用品',
    fileSize: '0.9MB',
    downloadCount: 156
  },
  {
    id: '7',
    name: '汽车轮毂',
    imageUrl: require('@/assets/library/7.jpg'),
    description: '赛车级轮毂模型',
    category: '汽车零件',
    fileSize: '5.8MB',
    downloadCount: 76
  },
  {
    id: '8',
    name: '游戏手柄外壳',
    imageUrl: require('@/assets/library/8.jpg'),
    description: '自定义游戏手柄外壳',
    category: '电子产品',
    fileSize: '2.7MB',
    downloadCount: 132
  }
];

const ModelLibrary: React.FC = () => {
  const [models, setModels] = useState<ModelItem[]>([]);
  const [filteredModels, setFilteredModels] = useState<ModelItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // 初始化加载模型数据
  useEffect(() => {
    // 模拟API请求延迟
    const timer = setTimeout(() => {
      setModels(mockModels);
      setFilteredModels(mockModels);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // 处理搜索功能
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredModels(models);
      return;
    }

    const results = models.filter(model => 
      model.name.toLowerCase().includes(searchText.toLowerCase()) ||
      model.description.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredModels(results);
  }, [searchText, models]);

  // 处理预览模型
  const handlePreview = (id: string) => {
    message.info(`预览模型 ${id}`);
     // 跳转到模型详情页，携带模型ID参数
    history.push({
      pathname: '/model-detail',
      state: { id }
    });
    // 这里可以添加实际预览功能的实现
  };

  // 处理下载模型
  const handleDownload = (id: string) => {
    message.success(`开始下载模型 ${id}`);
    // 这里可以添加实际下载功能的实现
  };

  // 处理添加到报价
  const handleAddToQuote = (id: string) => {
    message.success(`已将模型 ${id} 添加到报价列表`);
    // 这里可以添加实际添加到报价功能的实现
  };

  return (
    <div className="model-library-page">
      <div className="page-header">
        <h1>3D模型库</h1>
        <p>浏览我们丰富的3D打印模型库，找到适合您项目的设计</p>
      </div>

      {/* 搜索框 */}
      <div className="search-container">
        <Input
          placeholder="搜索模型名称或描述..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          className="search-input"
        />
      </div>

      {/* 模型列表 - 瀑布流布局 */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>加载模型中...</p>
        </div>
      ) : (
        <div className="model-grid">
          {filteredModels.length > 0 ? (
            filteredModels.map(model => (
              <Card key={model.id} className="model-card">
                <div className="model-image-container">
                  <img 
                    src={model.imageUrl} 
                    alt={model.name} 
                    className="model-image"
                  />
                  <div className="image-overlay">
                    <Button
                      icon={<EyeOutlined />}
                      size="large"
                      shape="circle"
                      className="preview-button"
                      onClick={() => handlePreview(model.id)}
                    />
                  </div>
                </div>
                <div className="model-info">
                  <h3 className="model-name">{model.name}</h3>
                  <p className="model-meta">{model.category} · {model.fileSize}</p>
                </div>
                <div className="model-actions">
                  <Space size="small">
                    <Button
                      icon={<DownloadOutlined />}
                      size="small"
                      onClick={() => handleDownload(model.id)}
                    >
                      下载
                    </Button>
                    <Button
                      icon={<ShoppingCartOutlined />}
                      size="small"
                      type="primary"
                      onClick={() => handleAddToQuote(model.id)}
                    >
                      加入报价
                    </Button>
                  </Space>
                </div>
              </Card>
            ))
          ) : (
            <div className="no-results">
              <p>没有找到匹配的模型，请尝试其他搜索关键词</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ModelLibrary;