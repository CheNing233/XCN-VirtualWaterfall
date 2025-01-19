export function generateRandomObjects() {
  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const randomObjects = [];

  for (let i = 0; i < 50; i++) {
    const obj = {
      width: Math.floor(Math.random() * (1024 - 512 + 1)) + 512,  // 随机宽度在512到1024之间
      height: Math.floor(Math.random() * (1024 - 512 + 1)) + 512, // 随机高度在512到1024之间
      color: randomColor(),  // 随机颜色
    };
    randomObjects.push(obj);
  }

  return randomObjects;
}


export function generateRandomId() {
  return 'id-' + Math.random().toString(36).substr(2, 9) + new Date().getTime();
}


