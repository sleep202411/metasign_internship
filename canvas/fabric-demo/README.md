## 安装
- cdn
<script src="https://unpkg.com/fabric@6.7.1/dist/fabric.min.js"></script>
- npm
npm install fabric --save

## 引入
- v6
import * as fabric from 'fabric'; 
import { Canvas, Rect } from 'fabric'; // browser
import { StaticCanvas, Rect } from 'fabric/node'; //node

- v5
import { fabric } from 'fabric';

## 基本使用
- 创建 canvas 实例
```js
const canvas = new fabric.Canvas('canvas');
```
- 添加元素  
    - 矩形
        ```js
        const rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 100,
        height: 100,
        });
        canvas.add(rect);
        ```
    - 文本
    Textbox 支持换行，可编辑文本
    IText 不支持换行
    width: 只有在 Textbox 类型时，才会启用换行
    - 圆形
        ```js
        const circle = new fabric.Circle({
        left: 200,
        top: 200,
        fill: 'blue',
        radius: 50,
        });
        canvas.add(circle);
        ```
