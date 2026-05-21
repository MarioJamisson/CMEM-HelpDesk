#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar as dependências do Python a partir de backend/requirements.txt
pip install -r backend/requirements.txt

# Rodar as migrações do banco de dados
python backend/manage.py migrate

# Coletar os arquivos estáticos para o WhiteNoise
python backend/manage.py collectstatic --no-input

# Executar o script de seed
python backend/seed.py
