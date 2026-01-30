#!/usr/bin/env python3
"""Validation script to check wine agent implementation."""
import sys
from pathlib import Path


def check_files():
    """Check all required files exist."""
    required_files = [
        'wine_agent.py',
        'requirements.txt',
        'README.md',
        '.gitignore',
        'MIGRATION.md',
        'agent/__init__.py',
        'agent/core.py',
        'agent/tools.py',
        'data/__init__.py',
        'data/db.py',
        'data/loader.py',
        'themes/__init__.py',
        'themes/presets.py',
        'web/__init__.py',
        'web/app.py',
        'web/templates/index.html',
        'web/templates/selection.html',
        'web/static/style.css',
    ]

    print("Checking required files...")
    missing = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing.append(file_path)
            print(f"  ✗ {file_path}")
        else:
            print(f"  ✓ {file_path}")

    if missing:
        print(f"\n✗ {len(missing)} files missing")
        return False
    else:
        print(f"\n✓ All {len(required_files)} files present")
        return True


def check_imports():
    """Check Python imports work."""
    print("\nChecking Python imports...")
    try:
        from agent.core import WineAgent
        print("  ✓ agent.core.WineAgent")
    except ImportError as e:
        print(f"  ✗ agent.core.WineAgent: {e}")
        return False

    try:
        from agent.tools import TOOLS
        print("  ✓ agent.tools.TOOLS")
    except ImportError as e:
        print(f"  ✗ agent.tools.TOOLS: {e}")
        return False

    try:
        from data.db import WineDatabase
        print("  ✓ data.db.WineDatabase")
    except ImportError as e:
        print(f"  ✗ data.db.WineDatabase: {e}")
        return False

    try:
        from data.loader import KaggleDatasetLoader
        print("  ✓ data.loader.KaggleDatasetLoader")
    except ImportError as e:
        print(f"  ✗ data.loader.KaggleDatasetLoader: {e}")
        return False

    try:
        from themes.presets import get_all_themes
        themes = get_all_themes()
        print(f"  ✓ themes.presets ({len(themes)} themes)")
    except ImportError as e:
        print(f"  ✗ themes.presets: {e}")
        return False

    try:
        from web.app import create_app
        print("  ✓ web.app.create_app")
    except ImportError as e:
        print(f"  ✗ web.app.create_app: {e}")
        return False

    print("\n✓ All imports successful")
    return True


def check_cli():
    """Check CLI works."""
    print("\nChecking CLI...")
    import subprocess

    try:
        result = subprocess.run(
            ['python', 'wine_agent.py', '--help'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("  ✓ CLI --help works")
        else:
            print(f"  ✗ CLI --help failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"  ✗ CLI check failed: {e}")
        return False

    try:
        result = subprocess.run(
            ['python', 'wine_agent.py', 'themes'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and 'By the Seine' in result.stdout:
            print("  ✓ CLI themes command works")
        else:
            print(f"  ✗ CLI themes failed")
            return False
    except Exception as e:
        print(f"  ✗ CLI themes check failed: {e}")
        return False

    print("\n✓ CLI functional")
    return True


def main():
    """Run all validation checks."""
    print("=" * 60)
    print("Wine Agent Implementation Validation")
    print("=" * 60)

    checks = [
        check_files(),
        check_imports(),
        check_cli(),
    ]

    print("\n" + "=" * 60)
    if all(checks):
        print("✓ All validation checks passed!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Setup Kaggle API credentials (~/.kaggle/kaggle.json)")
        print("2. Run: python wine_agent.py setup")
        print("3. Run: python wine_agent.py themes")
        print("4. Run: python wine_agent.py web")
        return 0
    else:
        print("✗ Some validation checks failed")
        print("=" * 60)
        return 1


if __name__ == '__main__':
    sys.exit(main())
