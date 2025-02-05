import {WaterfallSize} from "./interface.ts";

export function findClosestIndex(arr: any[], target: number, getNumber: (item: any) => number) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = getNumber(arr[mid]);  // 使用自定义函数获取数字部分

    // 如果正好命中目标值，直接返回下标
    if (midValue === target) {
      return mid;
    }

    // 继续二分查找
    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // 此时，left 指向第一个大于目标值的位置，right 指向第一个小于目标值的位置
  if (left >= arr.length) {
    return right; // target 比数组中的所有元素都大，返回最后一个元素下标
  }

  if (right < 0) {
    return left; // target 比数组中的所有元素都小，返回第一个元素下标
  }

  // 比较 target 与 arr[left] 和 arr[right] 的差距，返回最接近的元素下标
  const leftValue = getNumber(arr[left]);
  const rightValue = getNumber(arr[right]);

  return (Math.abs(leftValue - target) < Math.abs(rightValue - target)) ? left : right;
}

export function getResponsiveValue(
  currentWidth: number,
  fallback: number,
  sizes: WaterfallSize
): number {
  if (Object.keys(sizes).length === 0)
    return fallback

  // 定义各个断点的宽度阈值
  const breakpoints = [
    {key: 'xs' as keyof WaterfallSize, value: 0},
    {key: 'sm' as keyof WaterfallSize, value: 576},
    {key: 'md' as keyof WaterfallSize, value: 768},
    {key: 'lg' as keyof WaterfallSize, value: 992},
    {key: 'xl' as keyof WaterfallSize, value: 1200},
    {key: 'xxl' as keyof WaterfallSize, value: 1600},
    {key: 'xxxl' as keyof WaterfallSize, value: 1920},
  ];

  // 查找最合适的值
  let result: number | null = null;

  // 遍历断点，寻找最合适的尺寸值
  for (let i = breakpoints.length - 1; i >= 0; i--) {
    const {key, value} = breakpoints[i];
    if (currentWidth >= value && sizes[key] !== undefined) {
      result = sizes[key];
      break;
    }
  }

  // 如果没有找到合适的值，查找最近的小值（或者返回 fallback）
  if (result === undefined) {
    // 查找小于等于当前宽度的最大值
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const {key, value} = breakpoints[i];
      if (currentWidth >= value && sizes[key] !== undefined) {
        result = sizes[key];
        break;
      }
    }
  }

  // 如果还是没有找到，返回 fallback 值
  return result !== null ? result : fallback;
}

export function rafThrottle(fn: any) {
  let lock = false;
  return function (this: any, ...args: any[]) {
    if (lock) return;
    lock = true;
    window.requestAnimationFrame(() => {
      fn.apply(this, args);
      lock = false;
    });
  };
}

export function debounce(fn: any, delay: number = 100) {
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function traceCaller(fn: any) {
  return () => {
    // 创建错误对象获取堆栈信息
    const err = new Error();

    // 解析堆栈信息
    const stackLines = err.stack?.split('\n') || [];

    // 过滤无关堆栈行（不同浏览器可能有不同偏移量）
    const relevantLine = stackLines.find(line =>
      line.includes('at ') &&
      !line.includes('traceCaller') &&
      !line.includes('new Error')
    );

    // 提取具体调用位置
    const match = relevantLine?.match(/\((.*):(\d+):(\d+)\)$/) ||
      relevantLine?.match(/(\w+\.\w+):(\d+):(\d+)$/);

    // 格式化输出
    if (match) {
      const [_, file, line, column] = match;
      console.warn(`Called from: ${file} (line ${line}, column ${column})`);
    } else {
      console.warn('Caller location not found');
    }

    fn()
  }
}
