#!/bin/bash

# Excalidraw 开发服务重启脚本
# 用于重启开发服务器以应用环境变量和配置更改

echo "🔄 正在重启 Excalidraw 开发服务..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 查找并终止现有的开发服务进程
echo "🛑 终止现有开发服务进程..."

# 方法1: 通过端口终止进程 (默认3000端口)
PORT=${1:-3000}
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "📍 发现端口 $PORT 上的进程 PID: $PID"
    kill -9 $PID
    echo "✅ 已终止进程 $PID"
else
    echo "ℹ️  端口 $PORT 上没有运行的进程"
fi

# 方法2: 通过进程名终止 (备用方案)
pkill -f "vite.*excalidraw" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true
pkill -f "yarn.*start" 2>/dev/null || true

# 等待进程完全终止
echo "⏳ 等待进程完全终止..."
sleep 2

# 清理缓存 (可选)
if [ "$2" = "--clear-cache" ]; then
    echo "🧹 清理缓存..."
    rm -rf node_modules/.vite 2>/dev/null || true
    rm -rf .vite 2>/dev/null || true
    rm -rf dist 2>/dev/null || true
    echo "✅ 缓存已清理"
fi

# 检查环境变量文件
echo "🔍 检查环境变量配置..."
if [ -f "excalidraw-app/.env.local" ]; then
    echo "✅ 发现 .env.local 文件"
    echo "📋 当前 Supabase 配置:"
    grep "VITE_SUPABASE" excalidraw-app/.env.local | sed 's/=.*/=***/' || echo "⚠️  未找到 Supabase 配置"
else
    echo "⚠️  警告: 未找到 excalidraw-app/.env.local 文件"
    echo "💡 提示: 请确保已配置 Supabase 环境变量"
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo "📍 服务将在 http://localhost:$PORT 启动"
echo "🔄 如需停止服务，请按 Ctrl+C"
echo ""

# 根据包管理器启动服务
if [ -f "yarn.lock" ]; then
    echo "📦 使用 Yarn 启动..."
    yarn start
elif [ -f "pnpm-lock.yaml" ]; then
    echo "📦 使用 PNPM 启动..."
    pnpm start
else
    echo "📦 使用 NPM 启动..."
    npm start
fi