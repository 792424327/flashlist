
export const INITIAL_DATA = [
  { id: 'h1', text: '工作', completed: false, level: 0, type: 'header', createdAt: Date.now() },
  { id: 't1', text: '准备周会报告', completed: false, level: 1, type: 'task', createdAt: Date.now() + 1 },
  { id: 't2', text: '整理 S9 项目文档', completed: false, level: 1, type: 'task', createdAt: Date.now() + 2 },
  { id: 'h2', text: '生活', completed: false, level: 0, type: 'header', createdAt: Date.now() + 3 },
  { id: 't3', text: '去超市买水果', completed: false, level: 1, type: 'task', createdAt: Date.now() + 4 },
  { id: 't4', text: '预约牙医', completed: true, level: 1, type: 'task', createdAt: Date.now() + 5 },
];

export const MAX_LEVEL = 4;
export const INDENT_WIDTH = 24; // px per level
