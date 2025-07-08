FROM mcr.microsoft.com/devcontainers/typescript-node:20

# 安装 Rovo CLI
RUN curl -LO https://acli.atlassian.com/linux/latest/acli_linux_amd64/acli \
    && chmod +x acli \
    && mv acli /usr/local/bin/rovo

# 可选：安装其他工具，如 git, nano 等
RUN apt-get update && apt-get install -y git
