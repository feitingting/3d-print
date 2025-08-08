import React from 'react';
import { Form, Select, Upload, Button, Card, message, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './index.less';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState } from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Option } = Select;

// 3D打印工艺选项
const printingProcesses = [
    { value: 'fdm', label: 'FDM (熔融沉积建模)' },
    { value: 'sla', label: 'SLA (立体光固化)' },
    { value: 'sls', label: 'SLS (选择性激光烧结)' },
    { value: 'dlp', label: 'DLP (数字光处理)' },
    { value: 'polyjet', label: 'PolyJet (聚合物喷射)' },
    { value: 'slm', label: 'SLM (选择性激光熔化)' },
    { value: 'ebm', label: 'EBM (电子束熔化)' },
];

// 3D打印材料选项（20种常见材料）
const materials = [
    { value: 'pla', label: 'PLA (聚乳酸)' },
    { value: 'abs', label: 'ABS (丙烯腈丁二烯苯乙烯)' },
    { value: 'petg', label: 'PETG (聚对苯二甲酸乙二醇酯)' },
    { value: 'nylon', label: '尼龙 (PA6/PA12)' },
    { value: 'pc', label: 'PC (聚碳酸酯)' },
    { value: 'peek', label: 'PEEK (聚醚醚酮)' },
    { value: 'pekk', label: 'PEKK (聚醚酮酮)' },
    { value: 'pva', label: 'PVA (聚乙烯醇)' },
    { value: 'hips', label: 'HIPS (高抗冲聚苯乙烯)' },
    { value: 'tpu', label: 'TPU (热塑性聚氨酯)' },
    { value: 'tpe', label: 'TPE (热塑性弹性体)' },
    { value: 'asa', label: 'ASA (丙烯腈苯乙烯丙烯酸酯)' },
    { value: 'pmma', label: 'PMMA (亚克力)' },
    { value: 'metal_aluminum', label: '金属-铝合金' },
    { value: 'metal_titanium', label: '金属-钛合金' },
    { value: 'metal_stainless', label: '金属-不锈钢' },
    { value: 'ceramic', label: '陶瓷' },
    { value: 'resin_standard', label: '树脂-标准型' },
    { value: 'resin_flexible', label: '树脂-柔性' },
    { value: 'resin_high_temp', label: '树脂-耐高温' },
];

// 填充类型选项
const infillTypes = [
    { value: 'solid', label: '实心' },
    { value: 'hollow', label: '空心' },
];

const OnlineQuotation: React.FC = () => {
    const [form] = Form.useForm();
    const [previewVisible, setPreviewVisible] = useState(false);
    const [loadingModel, setLoadingModel] = useState(false);
    const [activeParams, setActiveParams] = useState<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null) as any;
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null) as any;
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Mesh | null>(null);

    // 初始化3D场景
    useEffect(() => {
        if (!previewRef.current) return;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        sceneRef.current = scene;

        // 创建相机
        const camera = new THREE.PerspectiveCamera(75, previewRef.current.clientWidth / previewRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 50;
        cameraRef.current = camera;

        // 创建渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(previewRef.current.clientWidth, previewRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        previewRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 10);
        scene.add(directionalLight);

        // 添加控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controlsRef.current = controls;

        // 添加网格辅助线
        const gridHelper = new THREE.GridHelper(100, 10);
        scene.add(gridHelper);

        // 动画循环
        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // 窗口大小调整
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current && previewRef.current) {
                cameraRef.current.aspect = previewRef.current.clientWidth / previewRef.current.clientHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(previewRef.current.clientWidth, previewRef.current.clientHeight);
            }
        };
        window.addEventListener('resize', handleResize);

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            previewRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    // 监听表单参数变化，更新预览
    useEffect(() => {
        if (!activeParams || !modelRef.current) return;

        // 根据选择的材料更新模型颜色
        const materialColorMap: Record<string, number> = {
            'pla': 0x87CEEB,
            'abs': 0x9ACD32,
            'petg': 0xFFD700,
            'nylon': 0xF5DEB3,
            'pc': 0xADD8E6,
            'metal_aluminum': 0xD2B48C,
            'metal_titanium': 0x808080,
            'metal_stainless': 0xC0C0C0,
            'ceramic': 0xF5F5DC,
            'resin_standard': 0xFFB6C1,
            // 其他材料颜色...
        };

        const color = materialColorMap[activeParams.material] || 0xCCCCCC;
        (modelRef.current.material as THREE.MeshPhongMaterial).color.set(color);

        // 根据填充类型更新透明度
        if (activeParams.infill === 'hollow') {
            (modelRef.current.material as THREE.MeshPhongMaterial).transparent = true;
            (modelRef.current.material as THREE.MeshPhongMaterial).opacity = 0.6;
        } else {
            (modelRef.current.material as THREE.MeshPhongMaterial).transparent = false;
            (modelRef.current.material as THREE.MeshPhongMaterial).opacity = 1;
        }
    }, [activeParams]);

    // 处理STL文件加载
    const loadSTLModel = (file: File) => {
        debugger;
        if (!sceneRef.current || !cameraRef.current) return;

        setLoadingModel(true);
        setPreviewVisible(true);

        const loader = new STLLoader();
        const reader = new FileReader();

        reader.onload = (event:any) => {
            try {
               // if (typeof event.target?.value !== 'string') return;

                // 移除旧模型
                if (modelRef.current) {
                    sceneRef.current!.remove(modelRef.current);
                }
                console.log('ererererererer',event.target.result);
                // 加载新模型
                const geometry = loader.parse(event.target.result);
                const material = new THREE.MeshPhongMaterial({
                    color: 0xCCCCCC,
                    specular: 0x111111,
                    shininess: 200
                });

                const mesh = new THREE.Mesh(geometry, material);
                modelRef.current = mesh;

                // 计算模型尺寸并居中
                const box = new THREE.Box3().setFromObject(mesh);
                const center = new THREE.Vector3();
                box.getCenter(center);
                mesh.position.sub(center);

                // 缩放模型以适应视图
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 40 / maxDim;
                mesh.scale.set(scale, scale, scale);

                sceneRef.current.add(mesh);

                // 更新相机位置以完整显示模型
                cameraRef.current.position.z = maxDim > 0 ? maxDim * 2 : 50;

            } catch (error) {
                console.error('Error loading STL file:', error);
                message.error('模型加载失败，请确保文件格式正确');
            } finally {
                setLoadingModel(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // 处理文件上传前的验证
    const beforeUpload = (file: File) => {
        const isSTL = file.type === 'application/sla' || file.name.endsWith('.stl');
        if (!isSTL) {
            message.error('请上传STL格式的3D模型文件！');
            return false;
        }
        loadSTLModel(file);
        return false; // 阻止自动上传，我们手动处理
    };

    // 表单提交处理
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setActiveParams(values);
            console.log('表单数据:', values);
            message.success('报价请求已提交，正在计算...');
            // 模拟报价生成
            setTimeout(() => {
                message.success('报价生成成功！总价：¥1280.00');
            }, 1500);
        } catch (error) {
            message.error('请填写所有必填项！');
        }
    };

    // 监听表单值变化
    const handleFormValuesChange = (changedValues: any, allValues: any) => {
        setActiveParams(allValues);
    };

    return (
        <div className="online-quotation-page">
            <Card title="3D打印在线报价" className="quotation-card">
                <Divider orientation="left">模型信息与参数</Divider>
                <Row gutter={[24, 24]}>
                    {/* 左侧表单区域 */}
                    <Col xs={24} lg={10} xl={9}>
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{ process: '', material: '', infill: '' }}
                            onValuesChange={handleFormValuesChange}
                        >
                            <Form.Item
                                name="process"
                                label="选择工艺"
                                rules={[{ required: true, message: '请选择3D打印工艺' }]}
                            >
                                <Select placeholder="请选择3D打印工艺">
                                    {printingProcesses.map(process => (
                                        <Option key={process.value} value={process.value}>
                                            {process.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="material"
                                label="选择材料"
                                rules={[{ required: true, message: '请选择3D打印材料' }]}
                            >
                                <Select placeholder="请选择3D打印材料">
                                    {materials.map(material => (
                                        <Option key={material.value} value={material.value}>
                                            {material.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="infill"
                                label="选择填充类型"
                                rules={[{ required: true, message: '请选择填充类型' }]}
                            >
                                <Select placeholder="请选择填充类型">
                                    {infillTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            {type.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="modelFile"
                                label="上传模型"
                                rules={[{ required: true, message: '请上传3D模型文件' }]}
                                extra="请上传STL格式的3D模型文件，文件大小不超过20MB"
                            >
                                <Upload
                                    name="modelFile"
                                    beforeUpload={beforeUpload}
                                    showUploadList={true}
                                >
                                    <Button icon={<UploadOutlined />}>点击上传STL文件</Button>
                                </Upload>
                            </Form.Item>

                            <Form.Item className="submit-button">
                                <Button type="primary" onClick={handleSubmit} size="large" block>
                                    生成报价
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col xs={24} lg={14} xl={15}>
                        <div className="model-preview-container">
                            <h3>模型预览</h3>
                            <div className="preview-wrapper" ref={previewRef}>
                                {!previewVisible ? (
                                    <Alert
                                        message="模型预览区"
                                        description="上传STL文件后可在此处预览3D模型，并实时查看参数变化效果"
                                        type="info"
                                        showIcon
                                    />
                                ) : loadingModel ? (
                                    <div className="loading-overlay">
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}/>
                                        <p>正在加载模型...</p>
                                    </div>
                                ) : null}
                            </div>
                            <div className="preview-controls">
                                <p>提示：可拖动鼠标旋转模型，滚轮缩放</p>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default OnlineQuotation;