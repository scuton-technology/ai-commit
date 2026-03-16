#!/bin/bash
# Mock script that simulates aic output for demo recording

echo ""
echo -e "  \033[36m🔍 Analyzing 2 changed files...\033[0m"
echo ""
sleep 0.5

# Spinner simulation
for i in {1..8}; do
  printf "\r\033[36m⠼\033[0m Generating commit suggestions..."
  sleep 0.15
  printf "\r\033[36m⠦\033[0m Generating commit suggestions..."
  sleep 0.15
done
printf "\r                                          \r"

echo -e "  \033[90mProvider: anthropic · 3 suggestions\033[0m"
echo ""
echo -e "  \033[1m?\033[0m Pick a commit message:"
echo -e "  \033[36m❯ \033[1m1.\033[0m feat(auth): add JWT refresh token rotation with automatic renewal"
echo -e "    \033[1m2.\033[0m refactor(middleware): improve token handling with expiry-based refresh"
echo -e "    \033[1m3.\033[0m feat(security): implement session token rotation for enhanced auth"
echo -e "    \033[2m↻  Regenerate\033[0m"
echo -e "    \033[2m✎  Edit manually\033[0m"
echo -e "    \033[2m✖  Abort\033[0m"
sleep 2

echo ""
echo -e "  \033[32m✓ Committed: feat(auth): add JWT refresh token rotation with automatic renewal\033[0m"
echo ""
