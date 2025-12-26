/**
 * 登录/注册页面
 */
import React, { useState } from 'react';
import axios from 'axios';

interface AuthPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const API_BASE_URL = '/api/v1';

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // 登录
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
        if (response.data.code === 200 && response.data.data) {
          localStorage.setItem('flashlist_token', response.data.data.token);
          localStorage.setItem('flashlist_user', JSON.stringify(response.data.data.user));
          onLoginSuccess(response.data.data.token, response.data.data.user);
        } else {
          setError(response.data.message || '登录失败');
        }
      } else {
        // 注册
        const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, { username, email, password });
        if (registerResponse.data.code === 200 || registerResponse.data.code === 201) {
          // 注册成功后自动登录
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
          if (loginResponse.data.code === 200 && loginResponse.data.data) {
            localStorage.setItem('flashlist_token', loginResponse.data.data.token);
            localStorage.setItem('flashlist_user', JSON.stringify(loginResponse.data.data.user));
            onLoginSuccess(loginResponse.data.data.token, loginResponse.data.data.user);
          }
        } else {
          setError(registerResponse.data.message || '注册失败');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              F
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FlashList</h1>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-semibold text-center mb-6">
            {isLogin ? '登录账户' : '创建账户'}
          </h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入用户名"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入邮箱"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '处理中...' : isLogin ? '登录' : '注册'}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
            </button>
          </div>

          {/* 测试账户提示 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            <p className="font-semibold mb-1">测试账户：</p>
            <p>邮箱：test@example.com</p>
            <p>密码：password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};
