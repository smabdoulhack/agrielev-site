# Constructeur du site : Node (même version majeure que netlify.toml) et git.
FROM node:24-bookworm-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends git ca-certificates \
	&& rm -rf /var/lib/apt/lists/*
COPY construire.sh /usr/local/bin/construire.sh
USER node
CMD ["/usr/local/bin/construire.sh"]
