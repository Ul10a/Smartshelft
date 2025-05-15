#!/usr/bin/env bash
set -eo pipefail

echo "===== INICIANDO BUILD EN RENDER ====="
echo "Node.js: $(node -v)"
echo "NPM: $(npm -v)"
echo "Directorio actual: $(pwd)"
echo "Contenido inicial:"
ls -la

# 1. Crear estructura de directorios en dist/
mkdir -p dist/{views,public,routes,controllers,models,utils}

# 2. Copiar archivos esenciales con verificación
echo "📦 Copiando archivos principales..."
ESSENTIAL_FILES=("server.js" "package.json" "package-lock.json" "mongo.env")
for file in "${ESSENTIAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Error: Archivo esencial $file no encontrado"
    exit 1
  fi
  cp -v "$file" dist/
done

# 3. Copiar vistas (verificación crítica)
echo "📂 Copiando vistas..."
if [ ! -d "views" ]; then
  echo "❌ Error Crítico: Directorio 'views' no encontrado"
  exit 1
fi
cp -Rv views/* dist/views/
echo "✅ Vistas copiadas. Contenido:"
ls -la dist/views/

# 4. Copiar código fuente
echo "🔌 Copiando código fuente..."
SOURCE_DIRS=("routes" "controllers" "models" "utils" "public")
for dir in "${SOURCE_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    cp -Rv "$dir"/* "dist/$dir/"
  else
    echo "⚠️ Advertencia: $dir no encontrado"
  fi
done

# 5. Instalar dependencias en dist/
echo "📦 Instalando dependencias en dist/..."
cd dist && npm install --production && cd ..

# 6. Verificación final
echo "=== ESTRUCTURA FINAL EN dist/ ==="
echo "Tamaño de dist/: $(du -sh dist/)"
echo "Contenido:"
tree -L 3 dist/ || ls -R dist/

echo "🟢 BUILD COMPLETADO CON ÉXITO 🟢"
