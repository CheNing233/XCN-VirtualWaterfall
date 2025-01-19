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

export function debounce(fn: any, delay: number = 300) {
  let timer: any = null;
  return function (this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}