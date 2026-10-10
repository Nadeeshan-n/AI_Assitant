# SmartShop AI — Local n8n using Docker Compose

This is a **local development** setup for the n8n backend of the SmartShop AI portfolio project. It uses a single n8n container and a named persistent volume. It does not install PostgreSQL, expose n8n to the public internet, or create an AI workflow automatically.

## Requirements
- Docker Desktop on Windows (with the WSL 2 backend enabled) or a supported Docker installation on another OS.
- Docker Compose v2 (included with Docker Desktop).

## Start (Windows PowerShell)
1. Open Docker Desktop and ensure the Docker engine is running.
2. Extract this folder and open PowerShell in it.
3. Verify: `docker --version` and `docker compose version`.
4. Validate configuration: `docker compose config`.
5. Start: `docker compose up -d`.
6. See status: `docker compose ps`.
7. Open http://localhost:5678 in your browser, and complete n8n's initial account setup if prompted.

## Daily commands
```powershell
docker compose up -d        # start
docker compose ps           # see status
docker compose logs -f n8n  # monitor logs (Ctrl+C exits logs only)
docker compose stop         # stop
docker compose down         # remove container and network, keep data volume
```

**Important:** `docker compose down -v` deletes the project's named volume, including local workflow data and credentials. Do not use it unless you intentionally want to erase the instance and have a verified backup.

## Next steps
In n8n, create a new workflow using Chat Trigger -> Basic LLM Chain -> OpenAI Chat Model or Google Gemini Chat Model. Configure model credentials in the n8n credentials UI (not in this YAML). Test with n8n's built-in chat.

Then we can add FAQ lookup, session memory, lead capture, escalation and a standalone React interface.

## Troubleshooting
- `docker` not recognized: check Docker Desktop installation and restart PowerShell.
- Cannot connect to Docker daemon: open Docker Desktop and verify its engine is running.
- WSL error: check `wsl --version`; if needed, update WSL from an administrator PowerShell with `wsl --update` and restart Docker Desktop.
- Port 5678 in use: stop the other local n8n instance, or change the **left-hand** 5678 in the Compose file to 5679 and open http://localhost:5679.
- Container exits: check `docker compose logs --tail=100 n8n`.
- Keep this service bound to 127.0.0.1 during local development. Never expose the n8n editor through an unprotected tunnel.

## Notes
- n8n image version is pinned to `2.42.6` (the documented stable release when this starter was prepared). Check n8n release notes before upgrading and back up data first.
- Port 5678 is bound only to localhost, not to your LAN.
- The persistent volume stores n8n's SQLite database and encryption key. Keep backups, especially before upgrades.
- This starter supports n8n workflows and AI Agent nodes. It does **not** include the separate optional n8n Assistant sandbox stack.

References:
- https://docs.n8n.io/deploy/host-n8n/install-options/install-with-docker.md
- https://docs.n8n.io/deploy/host-n8n/install-options/install-using-docker-compose.md
- https://docs.docker.com/desktop/setup/install/windows-install/
