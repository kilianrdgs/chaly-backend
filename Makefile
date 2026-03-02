.PHONY: clean install reset prisma-copy-api prisma-copy-auth prisma-copy api-build auth-build build api-deploy auth-deploy deploy all

# -----------------------------------------------------------------------
clean:
	rm -rf services/*/node_modules services/*/dist services/*/prisma
	rm -rf node_modules package-lock.json

# -----------------------------------------------------------------------
install:
	cd services/api-lambda && npm install
	cd services/auth-lambda && npm install

reset: clean install
# -----------------------------------------------------------------------
# Copy Prisma schema to each service
prisma-copy-api:
	mkdir -p services/api-lambda/prisma
	cp prisma/schema.prisma services/api-lambda/prisma/schema.prisma

prisma-copy-auth:
	mkdir -p services/auth-lambda/prisma
	cp prisma/schema.prisma services/auth-lambda/prisma/schema.prisma

prisma-copy: prisma-copy-api prisma-copy-auth
# -----------------------------------------------------------------------
# Build services

api-build: prisma-copy
	cd services/api-lambda && ./node_modules/.bin/prisma generate && npm run build

auth-build: prisma-copy
	cd services/auth-lambda && ./node_modules/.bin/prisma generate && npm run build

build: api-build auth-build
# -----------------------------------------------------------------------
# Deploy services

api-deploy:
	cd services/api-lambda && npm run deploy

auth-deploy:
	cd services/auth-lambda && npm run deploy


deploy: api-deploy auth-deploy
# -----------------------------------------------------------------------
# All tasks

all: clean install build deploy