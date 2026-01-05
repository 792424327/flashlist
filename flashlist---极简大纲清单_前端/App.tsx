
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges
} from '@dnd-kit/modifiers';
import { v4 as uuidv4 } from 'uuid';
import { FlashListItem } from './types';
import { INITIAL_DATA } from './constants';
import { TodoItem } from './components/TodoItem';
import { AuthPage } from './components/AuthPage';
import { Plus, Command, Cloud, Settings, Search, Heading, LogOut } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = '/api/v1';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器：自动添加Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flashlist_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // 直接返回data部分
  },
  (error) => {
    // Token过期或无效
    if (error.response?.status === 401) {
      localStorage.removeItem('flashlist_token');
      localStorage.removeItem('flashlist_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default function App() {
  // 认证状态
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('flashlist_token');
  });
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('flashlist_user');
    return saved ? JSON.parse(saved) : null;
  });

  // 待办事项状态
  const [items, setItems] = useState<FlashListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lastFocusedId, setLastFocusedId] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated]);

  // 组件卸载时清除所有防抖定时器
  useEffect(() => {
    return () => {
      Object.values(updateTimersRef.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/items');
      if (response.code === 200 && response.data) {
        setItems(response.data);

        // 如果服务器没有数据，检查localStorage并迁移
        if (response.data.length === 0) {
          await migrateLocalStorageData();
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      // 如果加载失败，使用localStorage数据
      const saved = localStorage.getItem('flashlist_data');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        setItems(INITIAL_DATA);
      }
    } finally {
      setLoading(false);
    }
  };

  // 迁移localStorage数据到服务器
  const migrateLocalStorageData = async () => {
    const saved = localStorage.getItem('flashlist_data');
    if (saved) {
      try {
        const localItems: FlashListItem[] = JSON.parse(saved);
        for (const item of localItems) {
          await apiClient.post('/items', {
            text: item.text,
            level: item.level,
            type: item.type,
          });
        }
        // 迁移成功后重新加载
        await loadItems();
        localStorage.removeItem('flashlist_data');
      } catch (error) {
        console.error('数据迁移失败:', error);
      }
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(prev, oldIndex, newIndex);

        // 调用API更新排序
        const reorderData = newItems.map((item, index) => ({
          id: item.id,
          order: index,
        }));
        apiClient.put('/items/reorder', { items: reorderData }).catch((error) => {
          console.error('更新排序失败:', error);
        });

        return newItems;
      });
    }
    setActiveId(null);
  };

  // 防抖定时器
  const updateTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const updateItem = useCallback(async (id: string, updates: Partial<FlashListItem>) => {
    // 乐观更新UI（立即更新界面）
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));

    // 如果是文本更新，使用防抖
    if ('text' in updates) {
      // 清除之前的定时器
      if (updateTimersRef.current[id]) {
        clearTimeout(updateTimersRef.current[id]);
      }

      // 设置新的定时器，800ms 后才发送请求
      updateTimersRef.current[id] = setTimeout(async () => {
        try {
          await apiClient.patch(`/items/${id}`, updates);
          delete updateTimersRef.current[id];
        } catch (error) {
          console.error('更新失败:', error);
          loadItems();
        }
      }, 800);
    } else {
      // 其他更新（如完成状态、类型等）立即发送
      try {
        await apiClient.patch(`/items/${id}`, updates);
      } catch (error) {
        console.error('更新失败:', error);
        loadItems();
      }
    }
  }, []);

  const moveCompletedToBottom = useCallback((id: string) => {
    setItems((prev) => {
      const targetIndex = prev.findIndex(item => item.id === id);
      if (targetIndex === -1) return prev;

      const item = prev[targetIndex];
      if (!item.completed) return prev;

      let boundaryIndex = targetIndex;
      for (let i = targetIndex + 1; i < prev.length; i++) {
        if (prev[i].type === 'header') break;
        boundaryIndex = i;
      }

      if (boundaryIndex === targetIndex) return prev;

      const newItems = [...prev];
      newItems.splice(targetIndex, 1);
      newItems.splice(boundaryIndex, 0, item);

      // 更新排序
      const reorderData = newItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));
      apiClient.put('/items/reorder', { items: reorderData }).catch((error) => {
        console.error('更新排序失败:', error);
      });

      return newItems;
    });
  }, []);

  const addItem = useCallback(async (afterId: string, level: number = 1, type: 'task' | 'header' = 'task') => {
    const tempId = uuidv4();
    const newItem: FlashListItem = {
      id: tempId,
      text: '',
      completed: false,
      level: level,
      type: type,
      createdAt: Date.now()
    };

    // 乐观更新UI
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === afterId);
      const newItems = [...prev];
      newItems.splice(index + 1, 0, newItem);
      return newItems;
    });
    setLastFocusedId(tempId);

    // 调用API创建
    try {
      const response = await apiClient.post('/items', {
        text: '',
        level,
        type,
        afterId,
      });

      // 用服务器返回的ID替换临时ID
      if (response.code === 201 && response.data) {
        setItems((prev) => prev.map((item) =>
          item.id === tempId ? { ...response.data!, id: response.data!.id } : item
        ));
        setLastFocusedId(response.data.id);
      }
    } catch (error) {
      console.error('创建失败:', error);
      // 失败时移除临时项
      setItems((prev) => prev.filter((i) => i.id !== tempId));
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    if (items.length <= 1) return; // Keep at least one item

    const itemToDelete = items.find(i => i.id === id);
    if (!itemToDelete) return;

    // 乐观更新UI
    const index = items.findIndex(i => i.id === id);
    const nextIndex = index > 0 ? index - 1 : 1;
    if (items[nextIndex]) {
      setLastFocusedId(items[nextIndex].id);
    }
    setItems((prev) => prev.filter((i) => i.id !== id));

    // 调用API删除
    try {
      await apiClient.delete(`/items/${id}`);
    } catch (error) {
      console.error('删除失败:', error);
      // 失败时恢复
      loadItems();
    }
  }, [items]);

  const indentItem = useCallback(async (id: string, direction: 'in' | 'out') => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newLevel = direction === 'in'
      ? Math.min(item.level + 1, 4)
      : Math.max(item.level - (item.type === 'header' ? 0 : 1), 0);

    // 乐观更新UI
    setItems((prev) => prev.map(i => (i.id === id ? { ...i, level: newLevel } : i)));

    // 调用API更新
    try {
      await apiClient.patch(`/items/${id}`, { level: newLevel });
    } catch (error) {
      console.error('更新缩进失败:', error);
      loadItems();
    }
  }, [items]);

  // 登录成功处理
  const handleLoginSuccess = (token: string, userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // 登出处理
  const handleLogout = () => {
    localStorage.removeItem('flashlist_token');
    localStorage.removeItem('flashlist_user');
    setIsAuthenticated(false);
    setUser(null);
    setItems([]);
  };

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] selection:bg-blue-100 pb-24">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <h1 className="text-lg font-bold tracking-tight">FlashList</h1>
        </div>

        <div className="flex items-center gap-4 text-gray-500">
          {user && (
            <span className="text-sm font-medium text-gray-600">
              {user.username || user.email}
            </span>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Cloud size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500"
            title="登出"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-12 px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">今天</h2>
            <p className="text-gray-400 mt-1 font-medium">{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
            <Command size={14} />
            <span>K 进行快速搜索</span>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-0.5 relative">
              {items.map((item) => (
                <TodoItem
                  key={item.id}
                  item={item}
                  onUpdate={(updates) => updateItem(item.id, updates)}
                  onEnter={(type) => addItem(item.id, item.level, type)}
                  onDelete={() => deleteItem(item.id)}
                  onIndent={(dir) => indentItem(item.id, dir)}
                  onToggleComplete={() => moveCompletedToBottom(item.id)}
                  isFocused={lastFocusedId === item.id}
                  onFocus={() => setLastFocusedId(item.id)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="drag-overlay rounded-md px-4 py-2 border border-gray-200">
                <TodoItem
                  item={items.find(i => i.id === activeId)!}
                  isOverlay
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Global Footer Add Buttons */}
        <div className="mt-8 grid grid-cols-2 gap-4">
            <button
                onClick={() => {
                    const lastItem = items[items.length - 1];
                    const level = lastItem ? lastItem.level : 0;
                    addItem(lastItem ? lastItem.id : '0', level, 'task');
                }}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 active:scale-95"
            >
                <Plus size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">添加新任务</span>
            </button>

            <button
                onClick={() => {
                    const lastItem = items[items.length - 1];
                    addItem(lastItem ? lastItem.id : '0', 0, 'header');
                }}
                className="group flex items-center justify-center gap-2 px-6 py-3 bg-white border border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 active:scale-95"
            >
                <Heading size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">添加新分类</span>
            </button>
        </div>
      </main>

      {/* Floating Shortcut Help */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
        <div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border border-gray-100 space-y-2 text-xs font-medium text-gray-500">
            <div className="flex justify-between gap-6"><span>Enter</span> <span>新任务</span></div>
            <div className="flex justify-between gap-6"><span>Tab</span> <span>增加缩进</span></div>
            <div className="flex justify-between gap-6"><span>Shift + Tab</span> <span>减少缩进</span></div>
            <div className="flex justify-between gap-6"><span>/h</span> <span>转为标题</span></div>
        </div>
      </div>
    </div>
  );
}
