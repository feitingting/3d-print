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
import { 
    calculatePrintingPrice, 
    calculateModelInfo, 
    formatPrice, 
    estimatePrintTime, 
    ModelInfo, 
    PriceCalculation,
    getMaterialDisplayName,
    getProcessDisplayName,
    getComplexityDisplayName,
    getSizeLevelDisplayName
} from '../../utils/priceCalculation';
import { submitPrintOrder, uploadSTLFile } from '../../api';
import { MATERIALS, getMaterialByValue } from '@/data/materials';

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

// 3D打印材料选项（使用共享数据源）
const materials = MATERIALS.map(m => ({
    value: m.value,
    label: m.label,
    color: m.color,
    properties: {
        ...m.materialProps,
        sheen: m.materialProps?.sheen ?? 0.0,
        sheenRoughness: m.materialProps?.sheenRoughness ?? 1.0,
        emissive: m.materialProps?.emissive ?? 0x000000,
        emissiveIntensity: m.materialProps?.emissiveIntensity ?? 0
    }
}));

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
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
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

    // 获取从材料页面传递过来的参数
    useEffect(() => {
        const locationState = history.location.state as any;
        if (locationState?.selectedMaterial) {
            // 自动填充材料字段
            form.setFieldsValue({
                material: locationState.selectedMaterial
            });
            // 显示提示信息
            const materialData = getMaterialByValue(locationState.selectedMaterial);
            if (materialData) {
                message.success(`已选择材料: ${materialData.name}`);
            }
        }
    }, []);

    // 初始化3D场景
    useEffect(() => {
        if (!previewRef.current) return;

        // 创建场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf5f5f5);
        sceneRef.current = scene;

        // 创建相机（参照modelDetail页面配置）
        const camera = new THREE.PerspectiveCamera(90, previewRef.current.clientWidth / previewRef.current.clientHeight, 0.1, 1000);
        // 设置相机初始位置
        camera.position.set(0, 30, 50);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        // 创建渲染器（优化金属材质渲染）
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        renderer.setSize(previewRef.current.clientWidth, previewRef.current.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 色调映射 - 增强高光和金属质感
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.8;  // 大幅提升曝光度（从 1.2 → 1.8）
        
        previewRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 优化灯光系统 - 极强光照，专为金属材质优化
        
        // 环境光 - 提供基础亮度（大幅提升）
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);  // 从 0.6 → 1.0
        scene.add(ambientLight);
        
        // 半球光 - 模拟天空和地面的漫反射（对金属材质很重要）
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5);  // 从 0.8 → 1.5，地面更亮
        hemisphereLight.position.set(0, 50, 0);
        scene.add(hemisphereLight);
        
        // 主方向光 - 模拟太阳光（大幅增强）
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);  // 从 1.2 → 2.0
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = false;
        scene.add(directionalLight);
        
        // 辅助方向光 - 从另一侧照亮模型（增强）
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.5);  // 从 0.8 → 1.5
        directionalLight2.position.set(-10, 10, -10);
        scene.add(directionalLight2);
        
        // 顶部点光源 - 增强顶部亮度
        const pointLight1 = new THREE.PointLight(0xffffff, 1.2, 150);  // 从 0.6 → 1.2，范围增大
        pointLight1.position.set(0, 30, 0);
        scene.add(pointLight1);
        
        // 前方点光源 - 增强正面亮度
        const pointLight2 = new THREE.PointLight(0xffffff, 1.0, 150);  // 从 0.5 → 1.0，范围增大
        pointLight2.position.set(0, 10, 30);
        scene.add(pointLight2);

        // 添加网格辅助线
        const gridHelper = new THREE.GridHelper(100, 20, 0x888888, 0x444444);
        gridHelper.position.y = 0; // 确保网格在y=0平面
        scene.add(gridHelper);

        // 添加坐标轴辅助线
        const axesHelper = new THREE.AxesHelper(50);
        scene.add(axesHelper);

        // 添加控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.target.set(0, 0, 0); // 控制器目标点设为原点
        controls.minDistance = 10; // 最小缩放距离
        controls.maxDistance = 200; // 最大缩放距离
        controlsRef.current = controls;

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
        const fullMaterialData = getMaterialByValue(activeParams.material);  // 获取完整材质数据
        const processData = printingProcesses.find(p => p.value === activeParams.process);
        
        if (modelRef.current && materialData && materialData.color !== undefined) {
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
            
            // 强制更新材质
            material.needsUpdate = true;
            
            // 触发渲染更新
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        }
        
        // 同时更新空心模型的颜色
        if (hollowModelRef.current && materialData && fullMaterialData) {
            const hollowMaterial = hollowModelRef.current.material as THREE.LineBasicMaterial;
            
            // 为金属材质使用更亮的颜色，确保可见性
            if (fullMaterialData.category === 'metal') {
                // 金属材质用白色线条，确保在所有背景下可见
                hollowMaterial.color.set(0xFFFFFF);
                hollowMaterial.linewidth = 4; // 金属用更粗的线条
                hollowMaterial.opacity = 0.9;
                hollowMaterial.transparent = true;
            } else if (fullMaterialData.value === 'transparent_pla') {
                hollowMaterial.color.set(materialData.color || 0x87CEEB);
                hollowMaterial.linewidth = 1;
                hollowMaterial.opacity = 0.7;
                hollowMaterial.transparent = true;
            } else {
                hollowMaterial.color.set(materialData.color || 0x87CEEB);
                hollowMaterial.linewidth = 2;
                hollowMaterial.opacity = 1;
                hollowMaterial.transparent = false;
            }
            
            hollowMaterial.needsUpdate = true;
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

    // 清理旧模型的所有相关数据
    const clearPreviousModel = () => {
        try {
            // 清理实心模型
            if (modelRef.current) {
                // 清理几何体资源
                if (modelRef.current.geometry) {
                    modelRef.current.geometry.dispose();
                }
                
                // 清理材质资源
                if (modelRef.current.material) {
                    if (Array.isArray(modelRef.current.material)) {
                        modelRef.current.material.forEach(material => material.dispose());
                    } else {
                        modelRef.current.material.dispose();
                    }
                }
                
                // 从场景中移除
                sceneRef.current?.remove(modelRef.current);
                modelRef.current = null;
            }

            // 清理空心模型
            if (hollowModelRef.current) {
                // 清理几何体资源
                if (hollowModelRef.current.geometry) {
                    hollowModelRef.current.geometry.dispose();
                }
                
                // 清理材质资源
                if (hollowModelRef.current.material) {
                    if (Array.isArray(hollowModelRef.current.material)) {
                        hollowModelRef.current.material.forEach(material => material.dispose());
                    } else {
                        hollowModelRef.current.material.dispose();
                    }
                }
                
                // 从场景中移除
                sceneRef.current?.remove(hollowModelRef.current);
                hollowModelRef.current = null;
            }

            // 重置相关状态
            setModelInfo(null);
            setPriceCalculation(null);
            setActiveParams(null);
            setIsHollow(false);
            setInfillPercentage(20);
            setUploadedFileUrl(null);
            
            console.log('Previous model cleared successfully');
        } catch (error) {
            console.error('Error clearing previous model:', error);
        }
    };

    // 处理STL文件加载
    const loadSTLModel = (file: File) => {
        if (!sceneRef.current || !cameraRef.current) return;

        setLoadingModel(true);
        setPreviewVisible(true);
        
        // 清理前一个模型的所有数据
        clearPreviousModel();
        
        setCurrentFile(file);

        const loader = new STLLoader();
        const reader = new FileReader();

        reader.onload = (event: any) => {
            try {
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
                const defaultColor = defaultMaterial?.color || 0x87CEEB;
                console.log(`🏗️ 创建空心模型，默认颜色: #${defaultColor.toString(16).padStart(6, '0').toUpperCase()}`);
                
                const hollowMaterial = new THREE.LineBasicMaterial({ 
                    color: defaultColor,
                    // linewidth: 3, // WebGL中可能不支持，移除
                    transparent: false,
                    opacity: 1.0
                });
                const hollowMesh = new THREE.LineSegments(hollowGeometry, hollowMaterial);
                hollowModelRef.current = hollowMesh;
                
                console.log(`✅ 空心模型创建完成，材质颜色: #${hollowMaterial.color.getHex().toString(16).padStart(6, '0').toUpperCase()}`);

                // 计算模型信息
                const calculatedModelInfo = calculateModelInfo(geometry);
                setModelInfo(calculatedModelInfo);

                // 计算模型尺寸并居中（参照modelDetail页面的完整居中逻辑）
                const box = new THREE.Box3().setFromObject(solidMesh);
                const center = new THREE.Vector3();
                // 将模型中心移动到包围盒中心
                box.getCenter(center);
                solidMesh.position.sub(center);
                hollowMesh.position.sub(center);
                
                // 确保模型底部在网格上
                const size = new THREE.Vector3();
                box.getSize(size);

                const bottomOffset = size.y / 2; // 模型底部到中心的距离
                solidMesh.position.y = bottomOffset; // 将模型底部放在网格上
                hollowMesh.position.y = bottomOffset; // 空心模型同样位置

                // 缩放模型以适应视图
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 40 / maxDim;
                // 缩放后再次居中
                solidMesh.scale.set(scale, scale, scale);
                hollowMesh.scale.set(scale, scale, scale);
                box.setFromObject(solidMesh); 
                box.getCenter(center);
                solidMesh.position.sub(center);
                hollowMesh.position.sub(center);

                // 默认显示实心模型
                sceneRef.current.add(solidMesh);
                // 空心模型添加到场景但暂时隐藏
                sceneRef.current.add(hollowMesh);
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
        if (modelRef.current && hollowModelRef.current) {
            if (checked) {
                // 显示空心模型，隐藏实心模型
                modelRef.current.visible = false;
                hollowModelRef.current.visible = true;
                
                // 切换到空心模式时，同步当前选择的材质颜色
                const formValues = form.getFieldsValue();
                if (formValues.material) {
                    updateModelMaterial(formValues.material);
                }
                
                console.log('切换到空心模型');
            } else {
                // 显示实心模型，隐藏空心模型
                modelRef.current.visible = true;
                hollowModelRef.current.visible = false;
                console.log('切换到实心模型');
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
    const beforeUpload = async (file: File) => {
        const isSTL = file.type === 'application/sla' || file.name.endsWith('.stl');
        if (!isSTL) {
            message.error('请上传STL格式的3D模型文件！');
            return false;
        }
        
        // 显示替换提示
        if (currentFile) {
            message.info('正在替换当前模型...');
        }

        // 先加载3D模型
        loadSTLModel(file);
        
        // 暂时使用文件名作为占位（本地预览模式）
        setUploadedFileUrl(`local://${file.name}`);
        
        // TODO: 后续启用服务器上传功能
        // try {
        //     message.loading('正在上传文件到服务器...', 0);
        //     const uploadResponse = await uploadSTLFile(file);
        //     
        //     if (uploadResponse.status === 200) {
        //         setUploadedFileUrl(uploadResponse.result.fileUrl);
        //         message.destroy();
        //         message.success('文件上传成功！');
        //     } else {
        //         message.destroy();
        //         message.error(uploadResponse.message || '文件上传失败');
        //         return false;
        //     }
        // } catch (error) {
        //     message.destroy();
        //     message.error('文件上传失败，请重试');
        //     console.error('Upload error:', error);
        //     return false;
        // }
        
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

            if (!currentFile) {
                message.error('请先上传STL文件');
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
                modelFileUrl: uploadedFileUrl,
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

    // 更新模型材质
    const updateModelMaterial = (materialValue: string) => {
        if (!modelRef.current || !sceneRef.current) return;
        
        const materialData = materials.find(m => m.value === materialValue);
        if (!materialData) {
            console.log(`❌ 找不到材质数据: ${materialValue}`);
            return;
        }
        
        console.log(`🔄 开始更新材质: ${materialData.label}`);
        console.log(`当前模式: ${isHollow ? '空心' : '实心'}`);
        
        // 更新实心模型材质（始终更新，为切换做准备）
        const mesh = modelRef.current;
        const currentMaterial = mesh.material as THREE.MeshPhysicalMaterial;
        
        // 更新材质属性
        currentMaterial.color.setHex(materialData.color || 0xCCCCCC);
        currentMaterial.roughness = materialData.properties.roughness || 0.5;
        currentMaterial.metalness = materialData.properties.metalness || 0.0;
        currentMaterial.transmission = materialData.properties.transmission || 0;
        currentMaterial.clearcoat = materialData.properties.clearcoat || 0.1;
        currentMaterial.clearcoatRoughness = materialData.properties.clearcoatRoughness || 0.1;
        currentMaterial.sheen = materialData.properties.sheen || 0.0;
        currentMaterial.sheenRoughness = materialData.properties.sheenRoughness || 1.0;
        currentMaterial.emissive.setHex(materialData.properties.emissive || 0x000000);
        currentMaterial.emissiveIntensity = materialData.properties.emissiveIntensity || 0;
        currentMaterial.needsUpdate = true;
        
        console.log(`✅ 实心模型材质已更新: ${materialData.label}`);
        
        // 更新空心模型的颜色（始终更新，为切换做准备）
        if (hollowModelRef.current) {
            const hollowMaterial = hollowModelRef.current.material as THREE.LineBasicMaterial;
            const newColor = materialData.color || 0xCCCCCC;
            
            console.log(`🔄 更新空心模型材质: ${materialData.label}`);
            console.log(`材质数据:`, materialData);
            console.log(`原始颜色值: ${materialData.color}`);
            console.log(`新颜色: #${newColor.toString(16).padStart(6, '0').toUpperCase()}`);
            console.log(`空心模型可见性: ${hollowModelRef.current.visible}`);
            console.log(`当前isHollow状态: ${isHollow}`);
            
            // 检查当前材质颜色
            const currentColor = hollowMaterial.color.getHex();
            console.log(`当前空心模型颜色: #${currentColor.toString(16).padStart(6, '0').toUpperCase()}`);
            
            // 确保颜色正确设置
            hollowMaterial.color.setHex(newColor);
            hollowMaterial.needsUpdate = true;
            
            // 强制重新创建材质实例以确保更新生效
            const newHollowMaterial = new THREE.LineBasicMaterial({ 
                color: newColor,
                transparent: false,
                opacity: 1.0
            });
            
            // 清理旧材质
            if (hollowModelRef.current.material) {
                if (Array.isArray(hollowModelRef.current.material)) {
                    hollowModelRef.current.material.forEach(mat => mat.dispose());
                } else {
                    hollowModelRef.current.material.dispose();
                }
            }
            
            // 设置新材质
            hollowModelRef.current.material = newHollowMaterial;
            
            // 验证新材质颜色
            const verifiedColor = (hollowModelRef.current.material as THREE.LineBasicMaterial).color.getHex();
            console.log(`验证新材质颜色: #${verifiedColor.toString(16).padStart(6, '0').toUpperCase()}`);
            
            // 根据当前模式显示相应的更新信息
            if (isHollow && hollowModelRef.current.visible) {
                console.log(`✅ 空心模式 - 空心模型颜色已更新为: #${newColor.toString(16).padStart(6, '0').toUpperCase()}`);
            } else if (!isHollow && modelRef.current.visible) {
                console.log(`✅ 实心模式 - 实心模型颜色已更新为: #${newColor.toString(16).padStart(6, '0').toUpperCase()}`);
            } else {
                console.log(`⚠️ 材质已设置，但当前模式为: ${isHollow ? '空心' : '实心'}`);
            }
        } else {
            console.log(`❌ 空心模型引用不存在`);
        }
        
        console.log(`🎨 材质更新完成: ${materialData.label}`);
    };

    // 监听表单值变化
    const handleFormValuesChange = (changedValues: any, allValues: any) => {
        setActiveParams(allValues);
        
        // 跟踪工艺选择状态
        if (changedValues.process) {
            setSelectedProcess(changedValues.process);
        }
        
        // 更新材质
        if (changedValues.material) {
            updateModelMaterial(changedValues.material);
        }
        
        // 应用工艺效果
        if (changedValues.material || changedValues.process) {
            const processData = printingProcesses.find(p => p.value === allValues.process);
            const materialData = materials.find(m => m.value === allValues.material);
            
            if (processData && materialData && modelRef.current) {
                const material = modelRef.current.material as THREE.MeshPhysicalMaterial;
                applyProcessEffects(material, processData, materialData);
            }
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
                                <Select 
                                    placeholder="请选择3D打印工艺"
                                    optionLabelProp="label"
                                >
                                    {printingProcesses.map(process => (
                                        <Option 
                                            key={process.value} 
                                            value={process.value}
                                            label={process.label}
                                        >
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
                                <Select 
                                    placeholder="请选择3D打印材料"
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option: any) => {
                                        const materialData = getMaterialByValue(option.value);
                                        if (!materialData) return false;
                                        return materialData.name.toLowerCase().includes(input.toLowerCase()) ||
                                               materialData.nameEn.toLowerCase().includes(input.toLowerCase()) ||
                                               materialData.description.toLowerCase().includes(input.toLowerCase());
                                    }}
                                    optionLabelProp="label"
                                >
                                    {materials.map(material => {
                                        const materialData = getMaterialByValue(material.value);
                                        return (
                                            <Option 
                                                key={material.value} 
                                                value={material.value}
                                                label={
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px',
                                                        justifyContent: 'space-between'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div 
                                                                style={{ 
                                                                    width: '12px', 
                                                                    height: '12px', 
                                                                    backgroundColor: `#${(material.color || 0xCCCCCC).toString(16).padStart(6, '0')}`,
                                                                    borderRadius: '2px',
                                                                    border: '1px solid #ddd',
                                                                    flexShrink: 0
                                                                }}
                                                            />
                                                            <span>{material.label}</span>
                                                        </div>
                                                        {materialData && (
                                                            <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: 500 }}>
                                                                {materialData.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                }
                                            >
                                                <div style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'space-between',
                                                    minHeight: '40px',
                                                    gap: '12px'
                                                }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '8px', 
                                                        flex: 1,
                                                        minHeight: '40px'
                                                    }}>
                                                        <div 
                                                            style={{ 
                                                                width: '12px', 
                                                                height: '12px', 
                                                                backgroundColor: `#${(material.color || 0xCCCCCC).toString(16).padStart(6, '0')}`,
                                                                borderRadius: '2px',
                                                                border: '1px solid #ddd',
                                                                flexShrink: 0
                                                            }}
                                                        />
                                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                            <div style={{ fontWeight: 500, lineHeight: '1.4' }}>{material.label}</div>
                                                            {materialData && (
                                                                <div style={{ fontSize: '12px', color: '#999', lineHeight: '1.4', marginTop: '2px' }}>
                                                                    {materialData.description.slice(0, 30)}...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {materialData && (
                                                        <span style={{ 
                                                            fontSize: '12px', 
                                                            color: '#2c3e50', 
                                                            fontWeight: 500,
                                                            flexShrink: 0,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            height: '40px'
                                                        }}>
                                                            {materialData.price}
                                                        </span>
                                                    )}
                                                </div>
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>

                            <Form.Item label="空心/实心">
                                <Switch 
                                    checked={isHollow} 
                                    onChange={handleHollowChange}
                                    checkedChildren="空心" 
                                    unCheckedChildren="空心"
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
                                    trackStyle={{ backgroundColor: '#2c3e50' }}
                                    handleStyle={{ borderColor: '#2c3e50' }}
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
                                extra="请上传STL格式的3D模型文件"
                            >
                                <Upload
                                    name="modelFile"
                                    beforeUpload={beforeUpload}
                                    showUploadList={{
                                        showPreviewIcon: false,
                                        showRemoveIcon: true,
                                        showDownloadIcon: false,
                                    }}
                                    maxCount={1}
                                    fileList={currentFile ? [{
                                        uid: '1',
                                        name: currentFile.name,
                                        status: 'done',
                                        size: currentFile.size,
                                        type: currentFile.type,
                                    }] : []}
                                    onRemove={() => {
                                        clearPreviousModel();
                                        setCurrentFile(null);
                                        message.info('模型已移除');
                                        return true;
                                    }}
                                >
                                    <Button icon={<UploadOutlined />}>
                                        {currentFile ? '替换STL文件' : '点击上传STL文件'}
                                    </Button>
                                </Upload>
                            </Form.Item>

                            {/* 当前模型信息显示 */}
                            {currentFile && modelInfo && (
                                <Form.Item label="当前模型信息">
                                    <Card size="small" style={{ marginTop: 8 }}>
                                        <Row gutter={[16, 8]}>
                                            <Col span={12}>
                                                <Text strong>文件名:</Text> {currentFile.name}
                                            </Col>
                                            <Col span={12}>
                                                <Text strong>文件大小:</Text> {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                                            </Col>
                                            <Col span={8}>
                                                <Text strong>体积:</Text> {modelInfo.volume.toFixed(2)} cm³
                                            </Col>
                                            <Col span={8}>
                                                <Text strong>表面积:</Text> {modelInfo.surfaceArea.toFixed(2)} cm²
                                            </Col>
                                            <Col span={8}>
                                                <Text strong>尺寸:</Text> {modelInfo.boundingBox.width.toFixed(1)} × {modelInfo.boundingBox.height.toFixed(1)} × {modelInfo.boundingBox.depth.toFixed(1)} cm
                                            </Col>
                                        </Row>
                                        <div style={{ marginTop: 8, textAlign: 'right' }}>
                                            <Button 
                                                size="small" 
                                                danger 
                                                onClick={() => {
                                                    clearPreviousModel();
                                                    setCurrentFile(null);
                                                    message.info('模型已清除');
                                                }}
                                            >
                                                清除模型
                                            </Button>
                                        </div>
                                    </Card>
                                </Form.Item>
                            )}

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
                                    <div className="preview-wrapper" ref={previewRef} style={{ height: '500px' }}>
                                {!previewVisible ? (
                                    <Alert
                                        message={<span style={{ color: '#ffffff', fontWeight: 600, fontSize: '16px' }}>模型预览区</span>}
                                        description={<span style={{ color: '#ffffff' }}>上传STL文件后可在此处预览3D模型，并实时查看参数变化效果</span>}
                                        type="info"
                                        showIcon
                                        className="preview-alert-custom"
                                        style={{
                                            background: 'linear-gradient(135deg, #2c3e50 0%, #e74c3c 100%)',
                                            border: 'none',
                                            color: '#ffffff'
                                        }}
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
                                                                   processData.properties.surfaceQuality === 'high' ? '#2c3e50' : 
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
                                    <Card title="价格计算详情" size="small">
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
                                                    valueStyle={{ color: '#2c3e50', fontSize: '24px' }}
                                                />
                                            </Col>
                                        </Row>
                                        <Divider />
                                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                            <Text type="secondary">
                                                <strong>材料:</strong> {getMaterialDisplayName(activeParams?.material || '')}
                                            </Text>
                                            <Text type="secondary">
                                                <strong>工艺:</strong> {getProcessDisplayName(activeParams?.process || '')}
                                            </Text>
                                            <Text type="secondary">
                                                <strong>复杂度:</strong> {getComplexityDisplayName(priceCalculation.breakdown.complexity)}
                                            </Text>
                                            <Text type="secondary">
                                                <strong>尺寸等级:</strong> {getSizeLevelDisplayName(priceCalculation.breakdown.sizeLevel)}
                                            </Text>
                                            <Text type="secondary">
                                                <strong>工艺系数:</strong> {priceCalculation.breakdown.processCoefficient}x
                                            </Text>
                                            <Text type="secondary">
                                                <strong>填充系数:</strong> {priceCalculation.breakdown.infillCoefficient.toFixed(2)}x
                                            </Text>
                                            <Text type="secondary">
                                                <strong>复杂度系数:</strong> {priceCalculation.breakdown.complexityCoefficient}x
                                            </Text>
                                            <Text type="secondary">
                                                <strong>尺寸系数:</strong> {priceCalculation.breakdown.sizeCoefficient}x
                                            </Text>
                                            <Text type="secondary">
                                                <strong>支撑系数:</strong> {priceCalculation.breakdown.supportCoefficient.toFixed(2)}x
                                            </Text>
                                            <Text type="secondary">
                                                <strong>数量:</strong> {priceCalculation.breakdown.quantity} 件
                                            </Text>
                                            {activeParams?.process && modelInfo && (
                                                <Text type="secondary">
                                                    <strong>预估打印时间:</strong> {estimatePrintTime(modelInfo, activeParams.process, priceCalculation.breakdown.infillCoefficient)} 小时
                                                </Text>
                                            )}
                                            {modelInfo?.calculationInfo && (
                                                <>
                                                    <Divider style={{ margin: '8px 0' }} />
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        <strong>计算方法:</strong> 体积({modelInfo.calculationInfo.volumeMethod}) | 表面积({modelInfo.calculationInfo.surfaceAreaMethod})
                                                    </Text>
                                                    <Text type={modelInfo.calculationInfo.isValid ? 'success' : 'warning'} style={{ fontSize: '12px' }}>
                                                        <strong>计算结果:</strong> {modelInfo.calculationInfo.isValid ? '有效' : '可能不准确'}
                                                    </Text>
                                                </>
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