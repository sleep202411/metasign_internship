import React, { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

const FabricCanvas = () => {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);  // 用来存储 fabric.Canvas 实例，避免重复创建

  useEffect(() => {
    // 如果 canvas 实例已存在，则不再初始化
    if (!fabricCanvas.current) {
      // 创建一个新的 fabric canvas 实例
      fabricCanvas.current = new fabric.Canvas(canvasRef.current);

      // 设置背景颜色
      fabricCanvas.current.backgroundColor = '#e9c8e5ff';  // 设置背景颜色
      fabricCanvas.current.renderAll();  // 调用 renderAll 来重新渲染 canvas

      // 创建并添加矩形
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        fill: 'red',
        width: 100,
        height: 100,
        angle: 45,
      });

      // 创建并添加圆形
      const circle = new fabric.Circle({
        left: 200,
        top: 200,
        fill: 'blue',
        radius: 50,
      });

      // 添加矩形和圆形到 canvas 上
      fabricCanvas.current.add(circle);
      fabricCanvas.current.add(rect);

      // 创建文本对象并添加到 canvas 上
      const text = new fabric.Textbox('Hello Fabric.js!', {
        left: 150,
        top: 150,
        fill: 'black',
        fontSize: 30,
        fontFamily: 'Arial',
        editable: true,  // 允许编辑
      });
      fabricCanvas.current.add(text);

      // 绘制爱心形状
      const heartPath = new fabric.Path('M 400 200 C 450 150, 550 150, 600 200 C 650 250, 500 400, 400 300 C 300 400, 150 250, 200 200 C 250 150, 350 150, 400 200 Z', {
        left: 200,
        top: 200,
        fill: 'pink',
        scaleX: 1.5,  // 放大比例
        scaleY: 1.5,
      });
      fabricCanvas.current.add(heartPath);
    }

    // 清理工作：在组件卸载时销毁 canvas 实例
    return () => {
      if (fabricCanvas.current) {
        fabricCanvas.current.dispose(); // 销毁 fabric canvas 实例
        fabricCanvas.current = null;    // 清除引用
      }
    };
  }, []);  // 依赖数组为空，确保只在组件挂载时执行一次

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600}></canvas>
    </div>
  );
};

export default FabricCanvas;
