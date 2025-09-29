import React from 'react';
import { Form, Select, Upload, Button, Card, message, Divider, InputNumber, Statistic, Space, Typography, Switch, Slider } from 'antd';
import { UploadOutlined, CalculatorOutlined } from '@ant-design/icons';
import './index.less';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useEffect, useRef, useState } from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { history } from '@@/core/umiExports';
import { calculatePrintingPrice, calculateModelInfo, formatPrice, estimatePrintTime, ModelInfo, PriceCalculation } from '../../utils/priceCalculation';
import { submitPrintOrder } from '../../api';

const { Option } = Select;
const { Title, Text } = Typography;

// 3D打印工艺选项
const printingProcesses = [
    { 
        value: 'fdm', 
        label: 'FDM (熔融沉积建模)',
        properties: {
            surfaceQuality: 'medium',
            layerVisibility: true,
            layerThickness: 0.2,
            supportRequired: true,
            finishType: 'matte',
            textureEffect: 'layered'
        }
    },
    { 
        value: 'sla', 
        label: 'SLA (立体光固化)',
        properties: {
            surfaceQuality: 'high',
            layerVisibility: false,
            layerThickness: 0.05,
            supportRequired: true,
            finishType: 'glossy',
            textureEffect: 'smooth'
        }
    },
    { 
        value: 'sls', 
        label: 'SLS (选择性激光烧结)',
        properties: {
            surfaceQuality: 'medium',
            layerVisibility: false,
            layerThickness: 0.1,
            supportRequired: false,
            finishType: 'matte',
            textureEffect: 'grainy'
        }
    },
    { 
        value: 'dlp', 
        label: 'DLP (数字光处理)',
        properties: {
            surfaceQuality: 'high',
            layerVisibility: false,
            layerThickness: 0.05,
            supportRequired: true,
            finishType: 'glossy',
            textureEffect: 'smooth'
        }
    },
    { 
        value: 'polyjet', 
        label: 'PolyJet (聚合物喷射)',
        properties: {
            surfaceQuality: 'very_high',
            layerVisibility: false,
            layerThickness: 0.014,
            supportRequired: true,
            finishType: 'glossy',
            textureEffect: 'ultra_smooth'
        }
    },
    { 
        value: 'slm', 
        label: 'SLM (选择性激光熔化)',
        properties: {
            surfaceQuality: 'high',
            layerVisibility: false,
            layerThickness: 0.03,
            supportRequired: true,
            finishType: 'metallic',
            textureEffect: 'metallic'
        }
    },
    { 
        value: 'ebm', 
        label: 'EBM (电子束熔化)',
        properties: {
            surfaceQuality: 'high',
            layerVisibility: false,
            layerThickness: 0.05,
            supportRequired: true,
            finishType: 'metallic',
            textureEffect: 'metallic'
        }
    },
];

// 3D打印材料选项（与模型详情页面保持一致）
const materials = [
    { 
        value: 'pla', 
        label: 'PLA (聚乳酸)', 
        color: 0x87CEEB,
        properties: { 
            roughness: 0.9, 
            metalness: 0.0, 
            transmission: 0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.1,
            sheen: 0.0,
            sheenRoughness: 1.0,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'abs', 
        label: 'ABS (丙烯腈丁二烯苯乙烯)', 
        color: 0x2E8B57,
        properties: { 
            roughness: 0.7, 
            metalness: 0.0, 
            transmission: 0,
            clearcoat: 0.2,
            clearcoatRoughness: 0.2,
            sheen: 0.0,
            sheenRoughness: 1.0,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'petg', 
        label: 'PETG (聚对苯二甲酸乙二醇酯)', 
        color: 0xFFD700,
        properties: { 
            roughness: 0.2, 
            metalness: 0.0, 
            transmission: 0.15,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1,
            sheen: 0.5,
            sheenRoughness: 0.3,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'nylon', 
        label: '尼龙 (PA6/PA12)', 
        color: 0xF5DEB3,
        properties: { 
            roughness: 0.5, 
            metalness: 0.1, 
            transmission: 0,
            clearcoat: 0.3,
            clearcoatRoughness: 0.3,
            sheen: 0.2,
            sheenRoughness: 0.8,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'metal_aluminum', 
        label: '金属-铝合金', 
        color: 0xC0C0C0,
        properties: { 
            roughness: 0.05, 
            metalness: 0.95, 
            transmission: 0,
            clearcoat: 0.1,
            clearcoatRoughness: 0.05,
            sheen: 0.0,
            sheenRoughness: 1.0,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'wood_pla', 
        label: '木纹PLA', 
        color: 0x8B4513,
        properties: { 
            roughness: 0.95, 
            metalness: 0.0, 
            transmission: 0,
            clearcoat: 0.0,
            clearcoatRoughness: 0.1,
            sheen: 0.0,
            sheenRoughness: 1.0,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'carbon_fiber', 
        label: '碳纤维PLA', 
        color: 0x2F2F2F,
        properties: { 
            roughness: 0.3, 
            metalness: 0.8, 
            transmission: 0,
            clearcoat: 0.9,
            clearcoatRoughness: 0.1,
            sheen: 0.7,
            sheenRoughness: 0.2,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
    { 
        value: 'transparent_pla', 
        label: '透明PLA', 
        color: 0xFFFFFF,
        properties: { 
            roughness: 0.1, 
            metalness: 0.0, 
            transmission: 0.8,
            clearcoat: 0.9,
            clearcoatRoughness: 0.05,
            sheen: 0.0,
            sheenRoughness: 1.0,
            emissive: 0x000000,
            emissiveIntensity: 0
        }
    },
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
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [isHollow, setIsHollow] = useState(false);
    const [infillPercentage, setInfillPercentage] = useState(20);
    const [selectedProcess, setSelectedProcess] = useState<string>('');
    const previewRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null) as any;
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null) as any;
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Mesh | null>(null);
    const hollowModelRef = useRef<THREE.LineSegments | null>(null);

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

    // 监听表单参数变化，更新预览和价格计算
    useEffect(() => {
        if (!activeParams || !modelRef.current) return;

        // 根据选择的材料和工艺更新模型材质
        const materialData = materials.find(m => m.value === activeParams.material);
        const processData = printingProcesses.find(p => p.value === activeParams.process);
        
        if (modelRef.current && materialData) {
            const material = modelRef.current.material as THREE.MeshPhysicalMaterial;
            
            // 应用基础材质属性
            material.color.set(materialData.color);
            material.roughness = materialData.properties.roughness;
            material.metalness = materialData.properties.metalness;
            material.transmission = materialData.properties.transmission;
            
            // 应用高级材质属性
            if (material.clearcoat !== undefined) {
                material.clearcoat = materialData.properties.clearcoat;
                material.clearcoatRoughness = materialData.properties.clearcoatRoughness;
            }
            
            if (material.sheen !== undefined) {
                material.sheen = materialData.properties.sheen;
                material.sheenRoughness = materialData.properties.sheenRoughness;
            }
            
            if (material.emissive !== undefined) {
                material.emissive.setHex(materialData.properties.emissive);
                material.emissiveIntensity = materialData.properties.emissiveIntensity;
            }
            
            // 根据材质类型调整透明度
            if (materialData.properties.transmission > 0) {
                material.transparent = true;
                material.opacity = 1 - materialData.properties.transmission * 0.3;
        } else {
                material.transparent = false;
                material.opacity = 1;
            }
            
            // 应用工艺效果
            if (processData) {
                applyProcessEffects(material, processData, materialData);
            }
            
            material.needsUpdate = true;
        }
        
        // 同时更新空心模型的颜色
        if (hollowModelRef.current && materialData) {
            const hollowMaterial = hollowModelRef.current.material as THREE.LineBasicMaterial;
            hollowMaterial.color.set(materialData.color);
            
            // 根据材质调整线宽
            if (materialData.value === 'metal_aluminum' || materialData.value === 'carbon_fiber') {
                hollowMaterial.linewidth = 3; // 金属和碳纤维用更粗的线条
            } else if (materialData.value === 'transparent_pla') {
                hollowMaterial.linewidth = 1; // 透明材质用细线条
                hollowMaterial.opacity = 0.7;
                hollowMaterial.transparent = true;
            } else {
                hollowMaterial.linewidth = 2; // 默认线宽
                hollowMaterial.opacity = 1;
                hollowMaterial.transparent = false;
            }
        }

        // 计算价格
        if (modelInfo && activeParams.material && activeParams.process) {
            const quantity = activeParams.quantity || 1;
            const infillType = isHollow ? 'hollow' : 'solid';
            const priceResult = calculatePrintingPrice({
                modelInfo,
                material: activeParams.material,
                process: activeParams.process,
                infill: infillType,
                infillPercentage: infillPercentage,
                quantity,
            });
            setPriceCalculation(priceResult);
        }
    }, [activeParams, modelInfo, isHollow, infillPercentage]);

    // 处理STL文件加载
    const loadSTLModel = (file: File) => {
        if (!sceneRef.current || !cameraRef.current) return;

        setLoadingModel(true);
        setPreviewVisible(true);
        setCurrentFile(file);

        const loader = new STLLoader();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            try {
                // 移除旧模型
                if (modelRef.current) {
                    sceneRef.current!.remove(modelRef.current);
                }

                // 加载新模型
                const geometry = loader.parse(event.target.result);
                
                // 创建实心模型 - 使用PLA默认材质
                const defaultMaterial = materials.find(m => m.value === 'pla');
                const solidMaterial = new THREE.MeshPhysicalMaterial({
                    color: defaultMaterial?.color || 0x87CEEB,
                    roughness: defaultMaterial?.properties.roughness || 0.9,
                    metalness: defaultMaterial?.properties.metalness || 0.0,
                    transmission: defaultMaterial?.properties.transmission || 0,
                    clearcoat: defaultMaterial?.properties.clearcoat || 0.1,
                    clearcoatRoughness: defaultMaterial?.properties.clearcoatRoughness || 0.1,
                    sheen: defaultMaterial?.properties.sheen || 0.0,
                    sheenRoughness: defaultMaterial?.properties.sheenRoughness || 1.0,
                    emissive: new THREE.Color(defaultMaterial?.properties.emissive || 0x000000),
                    emissiveIntensity: defaultMaterial?.properties.emissiveIntensity || 0
                });
                const solidMesh = new THREE.Mesh(geometry, solidMaterial);
                modelRef.current = solidMesh;

                // 创建空心模型（使用EdgeGeometry显示边缘）
                const hollowGeometry = new THREE.EdgesGeometry(geometry);
                const hollowMaterial = new THREE.LineBasicMaterial({ 
                    color: defaultMaterial?.color || 0x87CEEB,
                    linewidth: 2
                });
                const hollowMesh = new THREE.LineSegments(hollowGeometry, hollowMaterial);
                hollowModelRef.current = hollowMesh;

                // 计算模型信息
                const calculatedModelInfo = calculateModelInfo(geometry);
                setModelInfo(calculatedModelInfo);

                // 计算模型尺寸并居中
                const box = new THREE.Box3().setFromObject(solidMesh);
                const center = new THREE.Vector3();
                box.getCenter(center);
                solidMesh.position.sub(center);
                hollowMesh.position.sub(center);

                // 缩放模型以适应视图
                const size = new THREE.Vector3();
                box.getSize(size);
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 40 / maxDim;
                solidMesh.scale.set(scale, scale, scale);
                hollowMesh.scale.set(scale, scale, scale);

                // 默认显示实心模型
                sceneRef.current.add(solidMesh);
                // 空心模型暂时隐藏
                hollowMesh.visible = false;

                // 更新相机位置以完整显示模型
                cameraRef.current.position.z = maxDim > 0 ? maxDim * 2 : 50;

                message.success('模型加载成功！');

            } catch (error) {
                console.error('Error loading STL file:', error);
                message.error('模型加载失败，请确保文件格式正确');
            } finally {
                setLoadingModel(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // 处理空心/实心切换
    const handleHollowChange = (checked: boolean) => {
        setIsHollow(checked);
        if (modelRef.current && hollowModelRef.current && sceneRef.current) {
            if (checked) {
                // 显示空心模型，隐藏实心模型
                modelRef.current.visible = false;
                hollowModelRef.current.visible = true;
                if (!sceneRef.current.children.includes(hollowModelRef.current)) {
                    sceneRef.current.add(hollowModelRef.current);
                }
            } else {
                // 显示实心模型，隐藏空心模型
                modelRef.current.visible = true;
                hollowModelRef.current.visible = false;
                if (sceneRef.current.children.includes(hollowModelRef.current)) {
                    sceneRef.current.remove(hollowModelRef.current);
                }
            }
        }
    };

    // 处理填充率变化
    const handleInfillChange = (value: number) => {
        setInfillPercentage(value);
        // 这里可以根据填充率调整模型的透明度或显示效果
        if (modelRef.current && !isHollow) {
            const material = modelRef.current.material as THREE.MeshPhysicalMaterial;
            material.opacity = 0.5 + (value / 100) * 0.5; // 透明度从0.5到1.0
            material.transparent = true;
            material.needsUpdate = true;
        }
    };

    // 根据工艺属性调整材质渲染效果
    const applyProcessEffects = (material: THREE.MeshPhysicalMaterial, processData: any, materialData: any) => {
        if (!processData || !materialData) return;

        const { finishType, surfaceQuality, textureEffect } = processData.properties;
        
        // 根据工艺的表面质量调整基础属性
        switch (surfaceQuality) {
            case 'very_high':
                material.roughness = Math.min(materialData.properties.roughness, 0.1);
                break;
            case 'high':
                material.roughness = Math.min(materialData.properties.roughness, 0.3);
                break;
            case 'medium':
                material.roughness = Math.max(materialData.properties.roughness, 0.4);
                break;
            case 'low':
                material.roughness = Math.max(materialData.properties.roughness, 0.7);
                break;
        }

        // 根据工艺的表面处理类型调整清漆和光泽
        switch (finishType) {
            case 'glossy':
                material.clearcoat = Math.max(material.clearcoat, 0.8);
                material.clearcoatRoughness = Math.min(material.clearcoatRoughness, 0.1);
                break;
            case 'matte':
                material.clearcoat = Math.min(material.clearcoat, 0.2);
                material.clearcoatRoughness = Math.max(material.clearcoatRoughness, 0.5);
                break;
            case 'metallic':
                material.metalness = Math.max(material.metalness, 0.8);
                material.clearcoat = Math.max(material.clearcoat, 0.6);
                material.clearcoatRoughness = Math.min(material.clearcoatRoughness, 0.2);
                break;
        }

        // 根据纹理效果调整材质属性
        switch (textureEffect) {
            case 'layered':
                // FDM分层效果 - 增加粗糙度模拟层线
                material.roughness = Math.max(material.roughness, 0.8);
                material.bumpScale = 0.1;
                break;
            case 'smooth':
                // SLA/DLP光滑效果
                material.roughness = Math.min(material.roughness, 0.2);
                material.clearcoat = Math.max(material.clearcoat, 0.9);
                break;
            case 'ultra_smooth':
                // PolyJet超光滑效果
                material.roughness = Math.min(material.roughness, 0.05);
                material.clearcoat = Math.max(material.clearcoat, 0.95);
                material.clearcoatRoughness = Math.min(material.clearcoatRoughness, 0.05);
                break;
            case 'grainy':
                // SLS颗粒效果
                material.roughness = Math.max(material.roughness, 0.6);
                material.bumpScale = 0.2;
                break;
            case 'metallic':
                // 金属打印效果
                material.metalness = Math.max(material.metalness, 0.9);
                material.roughness = Math.min(material.roughness, 0.1);
                material.clearcoat = Math.max(material.clearcoat, 0.7);
                break;
        }

        material.needsUpdate = true;
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
            
            if (!modelInfo) {
                message.error('请先上传3D模型文件');
                return;
            }

            if (!priceCalculation) {
                message.error('请完善所有参数以计算价格');
                return;
            }

            const orderData = {
                serviceName: '3D打印服务',
                process: values.process,
                material: values.material,
                infill: isHollow ? 'hollow' : 'solid',
                infillPercentage: infillPercentage,
                quantity: values.quantity || 1,
                modelInfo,
                priceCalculation,
                estimatedTime: estimatePrintTime(modelInfo, values.process),
            };

            // 提交订单到后端
            message.loading('正在提交订单...', 0);
            const response = await submitPrintOrder(orderData);
            message.destroy();
            debugger;
            if (response) {
                message.success('订单提交成功！');
                
        const orderDetails = {
                    ...orderData,
                    orderId: response.orderId,
                    modelFile: currentFile,
        };

        // 跳转到支付页面并传递参数
        history.push({
            pathname: '/payment',
            state: { orderDetails }
        });
            } else {
                message.error(response.message || '订单提交失败');
            }
        } catch (error) {
            message.destroy();
            console.error('订单提交错误:', error);
            message.error('订单提交失败，请重试');
        }
    };

    // 监听表单值变化
    const handleFormValuesChange = (changedValues: any, allValues: any) => {
        setActiveParams(allValues);
        
        // 跟踪工艺选择状态
        if (changedValues.process) {
            setSelectedProcess(changedValues.process);
        }
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
                            initialValues={{ process: '', material: '', quantity: 1 }}
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
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontWeight: 500 }}>{process.label}</div>
                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                    {process.properties.surfaceQuality === 'very_high' && '🎯 超高精度'}
                                                    {process.properties.surfaceQuality === 'high' && '✨ 高精度'}
                                                    {process.properties.surfaceQuality === 'medium' && '⚡ 中等精度'}
                                                    {process.properties.surfaceQuality === 'low' && '🔧 低精度'}
                                                    {' • '}
                                                    {process.properties.finishType === 'glossy' && '✨ 高光泽'}
                                                    {process.properties.finishType === 'matte' && '🔘 哑光'}
                                                    {process.properties.finishType === 'metallic' && '⚡ 金属质感'}
                                                    {' • '}
                                                    {process.properties.supportRequired ? '需要支撑' : '无需支撑'}
                                                </div>
                                            </div>
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div 
                                                    style={{ 
                                                        width: '12px', 
                                                        height: '12px', 
                                                        backgroundColor: `#${material.color.toString(16).padStart(6, '0')}`,
                                                        borderRadius: '2px',
                                                        border: '1px solid #ddd'
                                                    }}
                                                />
                                                <span>{material.label}</span>
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="空心/实心">
                                <Switch 
                                    checked={isHollow} 
                                    onChange={handleHollowChange}
                                    checkedChildren="空心" 
                                    unCheckedChildren="实心"
                                />
                            </Form.Item>

                            <Form.Item label={`填充率：${infillPercentage}%`}>
                                <Slider
                                    min={0}
                                    max={100}
                                    value={infillPercentage}
                                    onChange={handleInfillChange}
                                    disabled={isHollow}
                                    marks={{
                                        0: '0%',
                                        25: '25%',
                                        50: '50%',
                                        75: '75%',
                                        100: '100%'
                                    }}
                                    style={{ 
                                        margin: '8px 0',
                                        display: 'block'
                                    }}
                                    trackStyle={{ backgroundColor: '#1890ff' }}
                                    handleStyle={{ borderColor: '#1890ff' }}
                                    railStyle={{ backgroundColor: '#f5f5f5' }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="quantity"
                                label="打印数量"
                                rules={[{ required: true, message: '请输入打印数量' }]}
                            >
                                <InputNumber
                                    min={1}
                                    max={100}
                                    placeholder="请输入打印数量"
                                    style={{ width: '100%' }}
                                />
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
                                <Button 
                                    type="primary" 
                                    onClick={handleSubmit} 
                                    size="large" 
                                    block
                                    icon={<CalculatorOutlined />}
                                >
                                    生成报价并提交订单
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col xs={24} lg={14} xl={15}>
                        <Row gutter={[16, 16]}>
                            {/* 模型预览区域 */}
                            <Col span={24}>
                                <Card title="模型预览" size="small">
                                    <div className="preview-wrapper" ref={previewRef} style={{ height: '300px' }}>
                                {!previewVisible ? (
                                    <Alert
                                        message="模型预览区"
                                        description="上传STL文件后可在此处预览3D模型，并实时查看参数变化效果"
                                        type="info"
                                        showIcon
                                    />
                                ) : loadingModel ? (
                                    <div className="loading-overlay">
                                        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
                                        <p>正在加载模型...</p>
                                    </div>
                                ) : null}
                            </div>
                            <div className="preview-controls">
                                        <Text type="secondary">提示：可拖动鼠标旋转模型，滚轮缩放</Text>
                            </div>
                                </Card>
                            </Col>

                            {/* 模型信息显示 */}
                            {modelInfo && (
                                <Col span={24}>
                                    <Card title="模型信息" size="small">
                                        <Row gutter={[16, 16]}>
                                            <Col span={8}>
                                                <Statistic
                                                    title="体积"
                                                    value={modelInfo.volume}
                                                    precision={2}
                                                    suffix="cm³"
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic
                                                    title="表面积"
                                                    value={modelInfo.surfaceArea}
                                                    precision={2}
                                                    suffix="cm²"
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <Statistic
                                                    title="最大尺寸"
                                                    value={Math.max(modelInfo.boundingBox.width, modelInfo.boundingBox.height, modelInfo.boundingBox.depth)}
                                                    precision={2}
                                                    suffix="cm"
                                                />
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            )}

                            {/* 工艺特性展示 */}
                            {selectedProcess && (
                                <Col span={24}>
                                    <Card title="工艺特性" size="small">
                                        {(() => {
                                            const processData = printingProcesses.find(p => p.value === selectedProcess);
                                            if (!processData) return null;
                                            
                                            return (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>表面质量：</span>
                                                        <span style={{ 
                                                            color: processData.properties.surfaceQuality === 'very_high' ? '#52c41a' : 
                                                                   processData.properties.surfaceQuality === 'high' ? '#1890ff' : 
                                                                   processData.properties.surfaceQuality === 'medium' ? '#faad14' : '#f5222d'
                                                        }}>
                                                            {processData.properties.surfaceQuality === 'very_high' && '🎯 超高'}
                                                            {processData.properties.surfaceQuality === 'high' && '✨ 高'}
                                                            {processData.properties.surfaceQuality === 'medium' && '⚡ 中等'}
                                                            {processData.properties.surfaceQuality === 'low' && '🔧 低'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>表面处理：</span>
                                                        <span>
                                                            {processData.properties.finishType === 'glossy' && '✨ 高光泽'}
                                                            {processData.properties.finishType === 'matte' && '🔘 哑光'}
                                                            {processData.properties.finishType === 'metallic' && '⚡ 金属质感'}
                                                        </span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>层厚：</span>
                                                        <span>{processData.properties.layerThickness}mm</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <span>支撑要求：</span>
                                                        <span style={{ color: processData.properties.supportRequired ? '#f5222d' : '#52c41a' }}>
                                                            {processData.properties.supportRequired ? '需要' : '无需'}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </Card>
                                </Col>
                            )}

                            {/* 价格计算显示 */}
                            {priceCalculation && (
                                <Col span={24}>
                                    <Card title="价格计算" size="small">
                                        <Row gutter={[16, 16]}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="材料成本"
                                                    value={priceCalculation.materialCost}
                                                    precision={2}
                                                    prefix="¥"
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="加工费"
                                                    value={priceCalculation.processingFee}
                                                    precision={2}
                                                    prefix="¥"
                                                />
                                            </Col>
                                            <Col span={24}>
                                                <Divider />
                                                <Statistic
                                                    title="总价格"
                                                    value={priceCalculation.finalPrice}
                                                    precision={2}
                                                    prefix="¥"
                                                    valueStyle={{ color: '#1890ff', fontSize: '24px' }}
                                                />
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text type="secondary">
                                                工艺系数: {priceCalculation.breakdown.processCoefficient}x
                                            </Text>
                                            <Text type="secondary">
                                                填充系数: {priceCalculation.breakdown.infillCoefficient}x
                                            </Text>
                                            <Text type="secondary">
                                                数量: {priceCalculation.breakdown.quantity} 件
                                            </Text>
                                            {activeParams?.process && modelInfo && (
                                                <Text type="secondary">
                                                    预计打印时间: {estimatePrintTime(modelInfo, activeParams.process)} 小时
                                                </Text>
                                            )}
                                        </Space>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Card>

        </div>
    );
};

export default OnlineQuotation;