#!/bin/bash
set -e

echo "=== INICIANDO BUILD PARA RENDER ==="

# 1. Crear estructura de directorios
mkdir -p dist/views dist/public dist/routes dist/controllers dist/models dist/utils

# 2. Copiar archivos esenciales
echo "📂 Copiando vistas..."
cp -R views/* dist/views/

echo "📦 Copiando archivos públicos..."
[ -d "public" ] && cp -R public/* dist/public/

echo "📄 Copiando archivos del servidor..."
cp server.js dist/
cp package.json dist/
cp package-lock.json dist/
cp mongo.env dist/

echo "🔌 Copiando rutas y controladores..."
cp -R routes/* dist/routes/
cp -R controllers/* dist/controllers/
cp -R models/* dist/models/
[ -d "utils" ] && cp -R utils/* dist/utils/

echo "✅ Build completado exitosamente"
echo "=== ESTRUCTURA FINAL ==="
ls -R dist/