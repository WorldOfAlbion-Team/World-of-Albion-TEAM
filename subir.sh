#!/bin/bash

# Colores para que se vea profesional
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}--- 🤖 INICIANDO PROCESO DE ACTUALIZACIÓN ---${NC}"

# 1. Ejecutar el despliegue de comandos localmente
echo -e "${YELLOW}🚀 Deploying commands...${NC}"
node deploy-commands.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Comandos registrados correctamente.${NC}"
else
    echo -e "${RED}❌ Error al registrar comandos. Abortando...${NC}"
    exit 1
fi

# 2. Preparar archivos para Git
echo -e "${GREEN}📝 Preparando cambios para GitHub...${NC}"
git add .

# 3. Pedir mensaje del commit
echo -e "${YELLOW}⌨️  Escribe qué cambiaste (o dale a ENTER para mensaje automático):${NC}"
read mensaje

if [ -z "$mensaje" ]; then
    mensaje="Actualización de comandos y DB: $(date +'%Y-%m-%d %H:%M')"
fi

# 4. Hacer el commit
git commit -m "$mensaje"

# 5. Subir a la nube
echo -e "${GREEN}🚀 Subiendo a GitHub...${NC}"
git push origin main

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}🎉 ¡LISTO! Render detectará el cambio y se reiniciará.${NC}"
echo -e "${GREEN}===========================================${NC}"
