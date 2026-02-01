#!/bin/bash

echo "=== Debug: IP Address Detection ==="
echo ""
echo "1. Testing: ip -o addr show scope global"
echo "---"
ip -o addr show scope global
echo ""
echo "2. Testing: ip -4 addr show scope global"
echo "---"
ip -4 addr show scope global
echo ""
echo "3. Testing: ip -6 addr show scope global"
echo "---"
ip -6 addr show scope global
echo ""
echo "4. Testing: hostname -I"
echo "---"
hostname -I
echo ""
echo "5. All network interfaces:"
echo "---"
ip addr show
