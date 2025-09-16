import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';

// 动态导入assets/more目录下的所有图片
const importAll = (r: any) => {
  return r.keys().map(r);
};

// 假设所有图片都在assets/more目录下
const images = Array.from({length: 26}, (_, i) => 
  `http://maphium.com/assets/more/${i.toString().padStart(2, '0')}.jpg`
);

const WaterfallGallery: React.FC = () => {
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // 预加载图片以获取尺寸信息
  useEffect(() => {
    const loadImageDimensions = async () => {
      const dimensions: {[key: string]: {width: number, height: number}} = {};
      
      for (const imgSrc of images) {
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = imgSrc;
          img.onload = () => {
            dimensions[imgSrc] = { width: img.width, height: img.height };
            resolve();
          };
        });
      }

      setImageDimensions(dimensions);
      setIsLoaded(true);
    };

    loadImageDimensions();
  }, []);

  return (
    <div className={styles.waterfallContainer}>
      <h2 className={styles.title}>更多工业零件</h2>
      {isLoaded ? (
        <div className={styles.flexContainer}>
          {images.map((imgSrc:string, index:number)=> {
            const { width, height } = imageDimensions[imgSrc];
            // 计算图片高度，保持宽高比，固定宽度为200px
            const fixedWidth = 200;
            const calculatedHeight = (height / width) * fixedWidth;
            
            return (
              <div 
                key={index} 
                className={styles.flexItem} 
                style={{ height: `${calculatedHeight}px` }}
              >
                <img 
                  src={imgSrc} 
                  alt={`Gallery image ${index + 1}`} 
                  className={styles.image} 
                  loading="lazy"
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>加载图片中...</p>
        </div>
      )}

      {/* <GridLayoutDemo/> */}
    </div>
  );
};

const GridLayoutDemo = () => {
  // 生成不同高度的数据
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    height: 100 + Math.random() * 200, // 随机高度100-300px
    color: `hsl(${i * 30}, 70%, 70%)` // 不同颜色
  }));

  return (
    <div className={styles.columnContainer}>
      {items.map(item => (
        <div
          key={item.id}
          className={styles.columnItem}
          style={{
            height: `${item.height}px`,
            backgroundColor: item.color
          }}
        >
          {item.id + 1}
        </div>
      ))}
    </div>
  );
};

export default WaterfallGallery;