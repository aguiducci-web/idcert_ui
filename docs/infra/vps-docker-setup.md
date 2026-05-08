# VPS + Docker setup

Guida per provisionare un VPS Linux pronto a ospitare container Docker
(Verdaccio, Caddy, ecc.) in produzione.

---

## 1. Provisioning VPS

### Hetzner (raccomandato)

1. Account → Cloud Console → New Project
2. Add Server:
   - Location: Nuremberg / Helsinki (latenza EU)
   - Image: **Ubuntu 24.04**
   - Type: **CX22** (€4.51/mese, 2 vCPU, 4GB RAM)
   - SSH key: incolla pubblica (`~/.ssh/id_ed25519.pub`)
   - Name: a piacere (es. `verdaccio-prod`)
3. Create → IP pubblico assegnato

### Alternative

- DigitalOcean Droplet $6/mese
- Contabo VPS S €4.50/mese
- Vultr Cloud Compute $6/mese

### DNS

Provider DNS:

- Record A: `<subdomain>.<dominio>` → IP VPS
- TTL: 300

Verifica propagazione:

```bash
dig <subdomain>.<dominio> +short
```

---

## 2. Hardening base

```bash
ssh root@<IP>

# update sistema
apt update && apt upgrade -y
apt install -y ufw fail2ban unattended-upgrades

# user non-root
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# disabilita root SSH + password auth
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# auto security updates
dpkg-reconfigure -plow unattended-upgrades
```

> **Warning:** verifica login SSH come `deploy` in **secondo terminale** PRIMA
> di chiudere sessione root, altrimenti rischio lockout.

```bash
# test in nuovo terminale
ssh deploy@<IP>
```

OK → procedi.

---

## 3. Install Docker

```bash
ssh deploy@<IP>

# script ufficiale Docker
curl -fsSL https://get.docker.com | sudo sh

# aggiungi user al gruppo docker
sudo usermod -aG docker deploy
newgrp docker

# verifica
docker version
docker compose version
```

Test container:

```bash
docker run --rm hello-world
```

---

## 4. Layout filesystem standard

Una directory per stack:

```bash
sudo mkdir -p /opt/<nome-stack>
sudo chown -R deploy:deploy /opt/<nome-stack>
cd /opt/<nome-stack>
```

Esempi:

- `/opt/verdaccio/`
- `/opt/caddy/`
- `/opt/grafana/`

---

## 5. Template `docker-compose.yml`

```yaml
services:
  app:
    image: <image>:<tag>
    container_name: app
    restart: unless-stopped
    expose: ["<port>"]
    volumes:
      - ./data:/app/data
      - ./conf:/app/conf
    networks: [web]

  caddy:
    image: caddy:2
    container_name: caddy
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks: [web]

networks:
  web:

volumes:
  caddy_data:
  caddy_config:
```

---

## 6. Reverse proxy con Caddy (TLS auto)

`Caddyfile`:

```
<subdomain>.<dominio> {
  reverse_proxy app:<port>
  encode gzip

  request_body {
    max_size 100MB
  }
}
```

Caddy fetch certificato Let's Encrypt automatico (richiede DNS propagato e
porte 80/443 aperte).

---

## 7. Avvio stack

```bash
cd /opt/<nome-stack>
docker compose up -d
docker compose logs -f
```

Verifica TLS:

```bash
curl -I https://<subdomain>.<dominio>/
# 200 OK
```

---

## 8. Operazioni comuni

```bash
# stop
docker compose down

# rebuild dopo update image
docker compose pull
docker compose up -d

# restart singolo servizio
docker compose restart app

# logs ultimi 100
docker compose logs --tail=100 -f

# exec shell in container
docker compose exec app sh

# stato risorse
docker stats
```

---

## 9. Backup

Cron giornaliero, retention 14 giorni:

```bash
sudo tee /etc/cron.daily/stack-backup > /dev/null <<'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf /opt/backups/stack-$DATE.tar.gz /opt/<nome-stack>/data
find /opt/backups -name 'stack-*.tar.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/stack-backup
sudo mkdir -p /opt/backups
```

Off-site con `restic` o `rclone` → S3 / Backblaze B2.

---

## 10. Monitoring

Base:

```bash
docker compose logs --tail=100 -f
docker stats
df -h
free -m
```

Per alerting serio:

- **Uptime Kuma** (Docker) → monitoring HTTP/TLS scadenza
- Prometheus + Grafana → metriche container
- Cron + `curl` + email → check minimal

---

## 11. Update sistema

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot   # se kernel update
```

Update immagini Docker:

```bash
cd /opt/<nome-stack>
docker compose pull
docker compose up -d
docker image prune -f
```

---

## 12. Sicurezza checklist

- [ ] SSH solo key, no root, no password
- [ ] UFW attivo: 22 / 80 / 443 only
- [ ] `fail2ban` attivo
- [ ] `unattended-upgrades` attivo
- [ ] User `deploy` non-root in gruppo docker
- [ ] Container espongono solo via Caddy network interna
- [ ] TLS Let's Encrypt auto via Caddy
- [ ] Backup giornaliero + off-site
- [ ] 2FA su provider VPS
- [ ] Monitoring uptime + alert

---

## Costo stimato

- VPS Hetzner CX22: €4.51/mese
- Backup off-site (B2 1GB): ~€0.005/mese
- **Totale: ~€5/mese**

---

## Riferimenti

- Hetzner Cloud: https://docs.hetzner.com/cloud/
- Docker install: https://docs.docker.com/engine/install/ubuntu/
- Caddy docs: https://caddyserver.com/docs/
- UFW: https://help.ubuntu.com/community/UFW
- fail2ban: https://github.com/fail2ban/fail2ban/wiki
