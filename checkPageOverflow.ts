export const checkPageOverflow = async (
  html: string, 
  options: {
    boundary: { width: number; height: number };
    checkInside?: boolean;
    slideSelector?: string; // 新增：选择slide元素的CSS选择器
  } = { boundary: { width: 1280, height: 720 }, checkInside: false, slideSelector: '.slide' }
): Promise<{
  isOverflow: boolean; // 是否溢出
  overflowDetails?: { currentHeight: number; overflowElements: string[] }; // 溢出详情
}> => {
  const { boundary, checkInside = false, slideSelector = '.slide' } = options;
  
  // 基本参数校验
  if (!boundary || typeof boundary.width !== 'number' || typeof boundary.height !== 'number') {
    throw new Error('boundary 必须包含有效的 width 和 height 数值');
  }
  
  if (boundary.width <= 0 || boundary.height <= 0) {
    throw new Error('boundary 的 width 和 height 必须为正数');
  }

  // 创建iframe容器
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: -9999px;
    width: ${boundary.width}px;
    height: ${boundary.height}px;
    overflow: visible;
    border: 1px solid #ccc;
    box-sizing: border-box;
  `;
  
  // 创建iframe
  const iframe = document.createElement('iframe');
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
  `;

  container.appendChild(iframe);
  document.body.appendChild(container);

  try {
    // 等待iframe加载完成
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    // 获取iframe内部的文档和window
    const iframeWindow = iframe.contentWindow;
    const iframeDoc = iframe.contentDocument || iframeWindow?.document;

    if (!iframeWindow || !iframeDoc) {
      throw new Error('无法获取iframe内部的文档或window');
    }

    const slideElement = iframeDoc.querySelector(slideSelector) as HTMLElement;
    if (slideElement) {
      slideElement.style.width = `${boundary.width}px`;
      slideElement.style.height = `${boundary.height}px`;
      slideElement.style.overflow = 'visible';
    }

    const currentHeight = iframeDoc.documentElement.scrollHeight;
    
    // 检查是否溢出
    const isOverflow = currentHeight > boundary.height;
    
    // 传递iframe内部的documentElement和slideElement
    const overflowElements: string[] = findOverflowElements(
      checkInside, 
      iframeDoc.documentElement, 
      iframeWindow,
      slideElement || iframeDoc.body 
    );

    return { 
      isOverflow, 
      overflowDetails: isOverflow ? {
        currentHeight,
        overflowElements
      } : undefined
    };
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
};

const findOverflowElements = (
  checkInside: boolean,
  container: Element, 
  targetWindow: Window,
  contentRoot?: Element 
): string[] => {
  const overflowElements: string[] = [];

  const walker = targetWindow.document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const element = node as HTMLElement;

    const { display, opacity, visibility } = targetWindow.getComputedStyle(element);

    const isHidden = opacity === '0' || visibility === 'hidden' || element.offsetParent === null;
    const isInline = display.startsWith('inline');

    if (isHidden || isInline) continue;

    const elementRect = element.getBoundingClientRect();

    const containerRect = contentRoot ? contentRoot.getBoundingClientRect() : container.getBoundingClientRect();
    
    const isOverflowing = elementRect.bottom > containerRect.bottom;
    
    if (isOverflowing) {
      if (checkInside) {
        // checkInside为true：只添加最具体的元素（没有溢出子元素的元素）
        if (!hasOverflowingChild(element, targetWindow, containerRect)) {
          const elementInfo = formatHTML(element.outerHTML);
          overflowElements.push(elementInfo);
        }
      } else {
        // checkInside为false：找到第一个溢出元素就返回（包含其所有内容）
        const elementInfo = formatHTML(element.outerHTML);
        overflowElements.push(elementInfo);
        return overflowElements; // 立即返回第一个找到的元素
      }
    }
  }

  return overflowElements;
};

// 辅助函数：检查元素是否有溢出的子元素
const hasOverflowingChild = (
  element: HTMLElement,
  targetWindow: Window,
  containerRect: DOMRect
): boolean => {
  const walker = targetWindow.document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const child = node as HTMLElement;
    
    if (child === element) continue; // 跳过自身
    
    const { display, visibility, opacity } = targetWindow.getComputedStyle(child);
    const isInline = display.startsWith('inline');
    const isHidden = visibility === 'hidden' || opacity === '0' || child.offsetParent === null;
    
    if (isInline || isHidden) continue;

    const childRect = child.getBoundingClientRect();
    const isChildOverflowing = childRect.bottom > containerRect.bottom;
    
    if (isChildOverflowing) {
      return true; // 找到溢出的子元素
    }
  }
  
  return false;
};

// 辅助函数：简单格式化HTML
const formatHTML = (html: string): string => {
  let formatted = html
    .replace(/>\s+</g, '>\n  <')
    .replace(/(<[^/][^>]*>)/g, '$1\n')
    .replace(/(<\/[^>]+>)/g, '\n$1');
  
  return formatted;
};