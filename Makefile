.PHONY: clean install reset prisma-copy-api prisma-copy-auth prisma-copy api-build auth-build build api-test auth-test test api-deploy auth-deploy deploy all all-api all-auth

# -----------------------------------------------------------------------
clean:
	rm -rf services/*/node_modules services/*/dist services/*/prisma
	rm -rf node_modules package-lock.json

# -----------------------------------------------------------------------
install:
	npm install
	cd services/api-lambda && npm install
	cd services/auth-lambda && npm install
	cd services/public-lambda && npm install

reset: clean install
# -----------------------------------------------------------------------
# Copy Prisma schema to each service
prisma-copy-api:
	mkdir -p services/api-lambda/prisma
	cp prisma/schema.prisma services/api-lambda/prisma/schema.prisma
	npx prisma generate --schema=services/api-lambda/prisma/schema.prisma

prisma-copy-auth:
	mkdir -p services/auth-lambda/prisma
	cp prisma/schema.prisma services/auth-lambda/prisma/schema.prisma
	npx prisma generate --schema=services/auth-lambda/prisma/schema.prisma 

prisma-copy: prisma-copy-api prisma-copy-auth
# -----------------------------------------------------------------------
# Build services

api-build: prisma-copy
	cd services/api-lambda && ./node_modules/.bin/prisma generate && npm run build

auth-build: prisma-copy
	cd services/auth-lambda && ./node_modules/.bin/prisma generate && npm run build

public-build:
	cd services/public-lambda && npm run build


build: api-build auth-build public-build
# -----------------------------------------------------------------------
# Test services

api-test:
	cd services/api-lambda && npm run test:run

auth-test:
	cd services/auth-lambda && npm run test:run

test: api-test auth-test


# -----------------------------------------------------------------------
# Deploy services

api-deploy:
	cd services/api-lambda && npm run deploy

auth-deploy:
	cd services/auth-lambda && npm run deploy

public-deploy:
	cd services/public-lambda && npm run deploy

deploy: api-deploy auth-deploy public-deploy
# -----------------------------------------------------------------------
# All tasks

all-api: reset prisma-copy-api api-build api-test api-deploy
all-auth: reset prisma-copy-auth auth-build auth-test auth-deploy
all-public: reset public-build public-deploy

all: reset prisma-copy build test deploy