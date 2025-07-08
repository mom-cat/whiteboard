FROM mcr.microsoft.com/devcontainers/typescript-node:20

# 安装 Rovo CLI
RUN curl -LO https://acli.atlassian.com/linux/latest/acli_linux_amd64/acli \
    && chmod +x acli \
    && mv acli /usr/local/bin/rovo

# 每次打开终端自动检测 Rovo 是否存在
RUN echo '[ -x "$(command -v rovo)" ] && echo "✅ Rovo CLI is installed: $(rovo --version)" || echo "❌ Rovo CLI is not installed"' >> /etc/bash.bashrc
