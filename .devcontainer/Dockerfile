FROM mcr.microsoft.com/devcontainers/typescript-node:20

# 为非 root 用户创建 ~/.local/bin 并下载 acli 二进制到该路径
USER codespace

RUN mkdir -p /home/codespace/.local/bin \
  && curl -LO https://acli.atlassian.com/linux/latest/acli_linux_amd64/acli \
  && chmod +x ./acli \
  && mv ./acli /home/codespace/.local/bin/acli

# 设置 PATH，使 ~/.local/bin 在前
ENV PATH="/home/codespace/.local/bin:${PATH}"

# 每次打开终端时检查是否安装成功（可选）
RUN echo '[ -x "$(command -v acli)" ] && echo "✅ Rovo CLI installed: $(acli --version)" || echo "❌ Rovo CLI not found"' >> /home/codespace/.bashrc
