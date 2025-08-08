import React, { useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'umi';
import { Card, Spin, Switch, Select, Radio, Carousel, Button, message, Typography, Divider } from 'antd';
import { LeftOutlined, RightOutlined, ReloadOutlined } from '@ant-design/icons';
import './index.less';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Meta } = Card;

// 模拟模型数据
interface ModelDetail {
  id: string;
  name: string;
  type: string;
  fileSize: string;
  images: string[];
  category: string;
  description: string;
}

// 模拟材质数据
const materials = [
  { value: 'pla', label: 'PLA (聚乳酸)', color: 0x87CEEB },
  { value: 'abs', label: 'ABS (丙烯腈丁二烯苯乙烯)', color: 0x9ACD32 },
  { value: 'petg', label: 'PETG (聚对苯二甲酸乙二醇酯)', color: 0xFFD700 },
  { value: 'nylon', label: '尼龙 (PA6/PA12)', color: 0xF5DEB3 },
  { value: 'metal_aluminum', label: '金属-铝合金', color: 0xD2B48C },
];

// 获取模型详情数据（模拟API请求）
const getModelDetail = async (id: string): Promise<ModelDetail> => {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  // 返回模拟数据
  return {
    id,
    name: `高精度3D模型 #${id}`,
    type: '机械零件',
    fileSize: '2.4MB',
    category: '工业设计',
    description: '这是一个高精度3D模型，适用于各种工业设计场景。',
    images: [
      require(`@/assets/library/${id}.jpg`),
      require(`@/assets/library/${id}.jpg`),
      require(`@/assets/library/${id}.jpg`),
    ]
  };
};

const ModelDetail: React.FC = () => {
  const location = useLocation<{ state: { id: string } }>() as any;
  const history = useHistory();
  const modelId = location.state.id;
  // 原代码逻辑无误，问题可能出在 useLocation 类型定义上。若要确保类型安全，可添加类型断言
  // 根据传入的类型 { state: { id: string } }，当前代码语法正确，推测可能是环境配置问题导致类型检查报错
  // 若仍报错，可使用以下代码替代
  // const modelId = (location as any)?.state?.id;

  const [model, setModel] = useState<ModelDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState('pla');
  const [rotationAxis, setRotationAxis] = useState('x');
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null) as any;
  const carouselRef = useRef<any>(null);

  // Three.js相关引用
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Mesh | null>(null);
  const gridRef = useRef<THREE.GridHelper | null>(null);
  const animateRef = useRef<number | null>(null);

      // 加载STL模型的函数
    const loadSTLModel = async (stlUrl: string) => {
      try {
        setLoading(true);
        // Step 1: 从URL获取文件并转换为File对象
        const response = await fetch(stlUrl,{
          headers: {
            'Accept': 'application/sla, application/octet-stream'
          }
        });
        
        if (!response.ok) throw new Error('模型文件加载失败');
         // 验证Content-Type
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/sla') && !contentType.includes('octet-stream')) {
          console.warn('非预期的Content-Type:', contentType);
          // 仍然尝试继续处理，但发出警告
        }
        // 直接获取ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        // // 从响应中获取Blob数据并创建File对象
        // const blob = await response.blob();
        // const fileName = stlUrl.split('/').pop() || 'model.stl';
        // const file = new File([blob], fileName, { type: 'application/sla'  });
        // // Step 2: 使用FileReader读取File对象为ArrayBuffer
        // const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        //   const reader = new FileReader();
        //   reader.onload = () => {
        //     if (reader.result instanceof ArrayBuffer) {
        //       resolve(reader.result);
        //     } else {
        //       reject(new Error('FileReader结果不是有效的ArrayBuffer'));
        //     }
        //   };
        //   reader.readAsArrayBuffer(file);
        // });

        // Step 3: 验证ArrayBuffer有效性（防止之前出现的超大尺寸错误）
        if (arrayBuffer.byteLength <= 0 || arrayBuffer.byteLength > 100 * 1024 * 1024) {
          throw new Error(`无效的文件大小: ${arrayBuffer.byteLength}字节，必须在0-100MB之间`);
        }

        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);

        // 检查模型复杂度是否合理
        // const triangleCount = geometry.attributes.position.count / 3;
        // if (triangleCount > 1000000) {
        //   throw new Error(`模型过于复杂(${triangleCount}个三角形)，请优化模型`);
        // }

        // 创建材质和网格
        const material = new THREE.MeshPhongMaterial({
          color: 0x87CEEB,
          specular: 0x111111,
          shininess: 200
        });
        const mesh = new THREE.Mesh(geometry, material);
        modelRef.current = mesh;

        // 模型居中与缩放
        const box = new THREE.Box3().setFromObject(mesh);
        const center = new THREE.Vector3();
        box.getCenter(center);
        mesh.position.sub(center);

        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 40 / maxDim;
        mesh.scale.set(scale, scale, scale);
        // 添加到场景
        if (sceneRef.current) {
          sceneRef.current.add(mesh);
          // 调整相机位置
          if (cameraRef.current) {
            cameraRef.current.position.z = maxDim > 0 ? maxDim * 2 : 50;
          }
        }
        message.success('3D模型加载成功');
      } catch (error) {
        console.error('STL模型加载失败:', error);
        message.error(error instanceof Error ? error.message : '3D模型加载失败');
      } finally {
        setLoading(false);
      }
    };

  // 加载模型详情数据
  useEffect(() => {
    if (!modelId) {
      message.error('模型ID不存在');
      history.goBack();
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
       
      
        // 加载STL模型
        const stlUrl = `/assets/library/${modelId}.stl`;
        await loadSTLModel(stlUrl);

      } catch (err) {
        setError('加载模型详情失败，请重试');
        console.error('模型详情加载失败:', err);
      } finally {
        setLoading(false);
      }
    };
    if(model){
      fetchData();
    }
  }, [model]);

  // 初始化3D场景
  useEffect(() => {
    const init = async()=>{
      // 获取模型详情
      const data = await getModelDetail(modelId);
      setModel(data);
    }
    if(modelId){
      init();
    }
    // 清理之前的场景
    if (animateRef.current) {
      cancelAnimationFrame(animateRef.current);
    }
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight); 
   
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // 添加网格辅助线
    const grid = new THREE.GridHelper(100, 10);
    gridRef.current = grid;
    scene.add(grid);

    // 添加控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    // 加载STL模型
    // const loader = new STLLoader();
    // try {
    //   const stlPath = require(`@/assets/library/${modelId}.stl`);

    //   loader.load(stlPath, (geometry) => {
    //     // 获取材质颜色
    //     const materialColor = materials.find(m => m.value === selectedMaterial)?.color || 0xCCCCCC;

    //     // 创建模型
    //     const material = new THREE.MeshPhongMaterial({
    //       color: materialColor,
    //       specular: 0x111111,
    //       shininess: 200
    //     });
    //     const mesh = new THREE.Mesh(geometry, material);
    //     modelRef.current = mesh;

    //     // 计算模型尺寸并居中
    //     const box = new THREE.Box3().setFromObject(mesh);
    //     const center = new THREE.Vector3();
    //     box.getCenter(center);
    //     mesh.position.sub(center);

    //     // 缩放模型以适应视图
    //     const size = new THREE.Vector3();
    //     box.getSize(size);
    //     const maxDim = Math.max(size.x, size.y, size.z);
    //     const scale = 40 / maxDim;
    //     mesh.scale.set(scale, scale, scale);

    //     scene.add(mesh);

    //     // 更新相机位置以完整显示模型
    //     camera.position.z = maxDim > 0 ? maxDim * 2 : 50;
    //   }, undefined, (error) => {
    //     console.error('Error loading STL file:', error);
    //     message.error('3D模型加载失败');
    //   });
    // } catch (err) {
    //   console.error('STL文件加载错误:', err);
    //   message.error('无法找到模型文件');
    // }

    // 动画循环
    const animate = () => {
      animateRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && containerRef.current) {
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
      }
    };
  }, [modelId]);
  

  // 处理材质选择变化
  const handleMaterialChange = (value: string) => {
    setSelectedMaterial(value);
    if (modelRef.current) {
      const color = materials.find(m => m.value === value)?.color || 0xCCCCCC;
      (modelRef.current.material as THREE.MeshPhongMaterial).color.set(color);
    }
  };

  // 处理旋转轴变化
  const handleRotationChange = (e: any) => {
    setRotationAxis(e.target.value);
    if (modelRef.current) {
      switch(e.target.value) {
        case 'x':
          modelRef.current.rotation.set(Math.PI / 2, 0, 0);
          break;
        case 'y':
          modelRef.current.rotation.set(0, Math.PI / 2, 0);
          break;
        case 'z':
          modelRef.current.rotation.set(0, 0, Math.PI / 2);
          break;
        default:
          modelRef.current.rotation.set(0, 0, 0);
      }
    }
  };

  // 处理网格显示切换
  const handleGridChange = (checked: boolean) => {
    setShowGrid(checked);
    if (gridRef.current) {
      gridRef.current.visible = checked;
    }
  };

  // 轮播图控制
  const handleCarouselNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const handleCarouselPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  // 重新加载模型
  const handleReloadModel = () => {
    if (modelRef.current && sceneRef.current) {
      sceneRef.current.remove(modelRef.current);
      modelRef.current = null;
    }
    // 触发3D场景重新初始化
    setSelectedMaterial(selectedMaterial);
  };

  // if (loading) {
  //   return (
  //     <div className="model-detail-loading">
  //       <Spin size="large" tip="加载模型详情中..." />
  //     </div>
  //   );
  // }


  return (
    <div className="model-detail-page">
      <Title level={2}>模型详情</Title>
      <Divider />

      <div className="model-detail-container">
        {/* 左侧信息区域 */}
        {
          error || !model
          ? <Card>
              <div className="error-content">
                <h3>{error || '模型不存在'}</h3>
                <Button type="primary" onClick={() => history.goBack()}>返回模型库</Button>
              </div>
            </Card>
          : <div className="model-info-panel" style={{width:'20%'}}>
              <Card title="模型信息" className="model-info-card">
                <div className="model-basic-info">
                  <div className="info-item">
                    <Text strong>模型名称：</Text>
                    <Text>{model.name}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>模型类型：</Text>
                    <Text>{model.type}</Text>
                  </div>
                  <div className="info-item">
                    <Text strong>文件大小：</Text>
                    <Text>{model.fileSize}</Text>
                  </div>
                </div>

                {/* 模型图片轮播 */}
                <div className="model-image-carousel">
                  <div className="carousel-controls">
                    <Button icon={<LeftOutlined />} size="small" onClick={handleCarouselPrev} />
                    <Button icon={<RightOutlined />} size="small" onClick={handleCarouselNext} />
                  </div>
                  <Carousel
                    ref={carouselRef}
                    autoplay
                    dots={true}
                    afterChange={(current) => setCurrentSlide(current)}
                    className="image-carousel"
                  >
                    {model.images.map((img, index) => (
                      <div key={index} className="carousel-item">
                        <img src={img} alt={`模型图片 ${index + 1}`} className="carousel-image" />
                      </div>
                    ))}
                  </Carousel>
                  <Text className="carousel-caption">模型来自于共享库，如有侵权，请联系删除</Text>
                </div>

                {/* 操作项 */}
                <div className="model-operations">
                  <Divider orientation="left">模型操作</Divider>

                  <div className="operation-item">
                    <Text>显示网格：</Text>
                    <Switch checked={showGrid} onChange={handleGridChange} />
                  </div>

                  <div className="operation-item">
                    <Text>选择材质：</Text>
                    <Select
                      value={selectedMaterial}
                      onChange={handleMaterialChange}
                      style={{ width: 160 }}
                    >
                      {materials.map(material => (
                        <Option key={material.value} value={material.value}>
                          {material.label}
                        </Option>
                      ))}
                    </Select>
                  </div>

                  <div className="operation-item">
                    <Text>翻转：</Text>
                    <Radio.Group value={rotationAxis} onChange={handleRotationChange} buttonStyle="solid">
                      <Radio.Button value="x">X</Radio.Button>
                      <Radio.Button value="y">Y</Radio.Button>
                      <Radio.Button value="z">Z</Radio.Button>
                    </Radio.Group>
                  </div>

                  <div className="operation-item reload-button">
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReloadModel}
                      size="small"
                    >
                      重新加载模型
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
        }
        {/* 右侧3D渲染区域 */}
        <div className="model-preview-panel">
          <Card title="3D模型预览" className="model-preview-card">
            <div className="model-preview-container">
              <div className="preview-wrapper" ref={containerRef}>
                                
              </div>
            </div>
            <div className="preview-tips">
              <Text type="secondary">提示：可拖动鼠标旋转模型，滚轮缩放</Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModelDetail;