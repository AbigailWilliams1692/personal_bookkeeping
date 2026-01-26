#!/usr/bin/env python3
########################################################################
# File: run.py
# Description: A simple runner for the Personal Bookkeeping App
# Author: AbigailWilliams1692
# Creation Date: 2026-01-25
# Version: 1.0.0
# License: MIT License
########################################################################

########################################################################
# Import Libraries
########################################################################
# Standard Packages
import os
import sys

# Local Packages
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.app import create_app


########################################################################
# Main
########################################################################
if __name__ == "__main__":
    app = create_app()
    print("=" * 50)
    print("个人财务记账App - 模块化版本")
    print("=" * 50)
    print("访问地址: http://127.0.0.1:5000")
    print("API端点:")
    print("  GET  /api/transactions     - 获取交易记录")
    print("  POST /api/transactions     - 添加交易记录")
    print("  GET  /api/summary          - 获取财务摘要")
    print("  GET  /api/exchange/rates   - 获取汇率")
    print("=" * 50)
    app.run(debug=True, port=5000)
    