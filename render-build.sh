#!/usr/bin/env bash
set -eo pipefail

echo "===== INICIANDO BUILD EN RENDER ====="
echo "Directorio actual: $(pwd)"
echo "Contenido:"
ls -la

# 1. Verificar archivos esenciales
ESSENTIAL_FILES=("server.js" "package.json" "package-lock.json" "mongo.env")
for file in "${ESSENTIAL_FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo "❌ Error: Archivo esencial $file no encontrado en $(pwd)"
    echo "Buscando en otras ubicaciones..."
    
    # Buscar en directorio padre
    if [ -f "../$file" ]; then
      echo "✅ Encontrado en directorio padre, copiando..."
      cp -v "../$file" .
    else
      echo "❌ Error Crítico: $file no existe en ninguna ubicación conocida"
      exit 1
    fi
  fi
done

# 2. Continuar con el build normal
echo "📦 Continuando con el build..."
mkdir -p dist/{views,public,routes,controllers,models,utils}

# Copiar archivos principales
cp -v server.js package.json package-lock.json mongo.env dist/

# Copiar vistas y código fuente
[ -d "views" ] && cp -Rv views/* dist/views/
[ -d "public" ] && cp -Rv public/* dist/public/
[ -d "routes" ] && cp -Rv routes/* dist/routes/
[ -d "controllers" ] && cp -Rv controllers/* dist/controllers/
[ -d "models" ] && cp -Rv models/* dist/models/
[ -d "utils" ] && cp -Rv utils/* dist/utils/

echo "✅ Build completado con éxito"
echo "Estructura final en dist/:"
ls -R dist/
