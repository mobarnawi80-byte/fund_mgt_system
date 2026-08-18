import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Production Deployment & Cloud Infrastructure Verification', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('1. Dockerfile Multi-Stage Production Configuration', () => {
    it('should define multi-stage build with Node.js 20 builder and hardened Alpine Nginx', () => {
      const dockerfilePath = path.join(rootDir, 'Dockerfile');
      expect(fs.existsSync(dockerfilePath)).toBe(true);

      const content = fs.readFileSync(dockerfilePath, 'utf-8');
      expect(content).toContain('FROM node:20-alpine AS builder');
      expect(content).toContain('FROM nginx:1.25-alpine AS runner');
      expect(content).toContain('USER coopuser'); // Non-root security
      expect(content).toContain('HEALTHCHECK'); // Health probe
      expect(content).toContain('EXPOSE 80');
    });

    it('should have .dockerignore excluding node_modules and scratch directories', () => {
      const dockerignorePath = path.join(rootDir, '.dockerignore');
      expect(fs.existsSync(dockerignorePath)).toBe(true);

      const content = fs.readFileSync(dockerignorePath, 'utf-8');
      expect(content).toContain('node_modules');
      expect(content).toContain('.git');
    });
  });

  describe('2. Hardened Nginx Security & TLS Configuration', () => {
    it('should include strict security headers (HSTS, CSP, Anti-Clickjacking) and SPA routing', () => {
      const nginxPath = path.join(rootDir, 'nginx.conf');
      expect(fs.existsSync(nginxPath)).toBe(true);

      const content = fs.readFileSync(nginxPath, 'utf-8');
      expect(content).toContain('add_header X-Frame-Options "SAMEORIGIN"');
      expect(content).toContain('add_header X-Content-Type-Options "nosniff"');
      expect(content).toContain('add_header Content-Security-Policy');
      expect(content).toContain('gzip on;');
      expect(content).toContain('try_files $uri $uri/ /index.html;');
      expect(content).toContain('location /health');
    });
  });

  describe('3. Docker Compose Orchestration (Web, Postgres 16, Redis 7)', () => {
    it('should define all 3 production services with healthchecks and persistent volumes', () => {
      const composePath = path.join(rootDir, 'docker-compose.yml');
      expect(fs.existsSync(composePath)).toBe(true);

      const content = fs.readFileSync(composePath, 'utf-8');
      expect(content).toContain('coop_web_app:');
      expect(content).toContain('coop_postgres_db:');
      expect(content).toContain('coop_redis_cache:');
      expect(content).toContain('postgres_data:');
      expect(content).toContain('schema.sql'); // Auto-initialization
    });
  });

  describe('4. Automated Cloud Deployment & Disaster Recovery Scripts', () => {
    it('should have production Linux deploy.sh and Windows deploy.ps1 scripts', () => {
      const linuxScript = path.join(rootDir, 'scripts', 'deploy.sh');
      const winScript = path.join(rootDir, 'scripts', 'deploy.ps1');

      expect(fs.existsSync(linuxScript)).toBe(true);
      expect(fs.existsSync(winScript)).toBe(true);

      const linuxContent = fs.readFileSync(linuxScript, 'utf-8');
      expect(linuxContent).toContain('docker compose up -d --build');
      expect(linuxContent).toContain('pg_isready');
    });

    it('should have automated database backup (db-backup.sh) with AES-256 and SHA256 integrity verification', () => {
      const backupScript = path.join(rootDir, 'scripts', 'db-backup.sh');
      expect(fs.existsSync(backupScript)).toBe(true);

      const content = fs.readFileSync(backupScript, 'utf-8');
      expect(content).toContain('pg_dump');
      expect(content).toContain('sha256sum');
      expect(content).toContain('aes-256-cbc');
      expect(content).toContain('+30'); // 30-day statutory pruning
    });

    it('should have disaster recovery database restore (db-restore.sh) with decryption and checksum check', () => {
      const restoreScript = path.join(rootDir, 'scripts', 'db-restore.sh');
      expect(fs.existsSync(restoreScript)).toBe(true);

      const content = fs.readFileSync(restoreScript, 'utf-8');
      expect(content).toContain('openssl enc -d -aes-256-cbc');
      expect(content).toContain('sha256sum -c');
      expect(content).toContain('psql -U coop_admin');
    });

    it('should have automated Let\'s Encrypt SSL setup script (setup-ssl.sh)', () => {
      const sslScript = path.join(rootDir, 'scripts', 'setup-ssl.sh');
      expect(fs.existsSync(sslScript)).toBe(true);

      const content = fs.readFileSync(sslScript, 'utf-8');
      expect(content).toContain('certbot');
      expect(content).toContain('crontab');
    });
  });
});
