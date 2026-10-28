"""Sandbox workspace isolation, zip-slip protection, and patch application."""

import os
import shutil
import zipfile
from pathlib import Path
from typing import Optional


class WorkspaceManager:
    """Manages isolated temp workspaces for project execution and patch testing."""

    @staticmethod
    def create_sandbox_workspace(source_dir: Path, target_dir: Path) -> Path:
        """Clones a project directory into an isolated sandbox location."""
        if target_dir.exists():
            shutil.rmtree(target_dir, ignore_errors=True)
        target_dir.mkdir(parents=True, exist_ok=True)

        if source_dir.exists():
            shutil.copytree(source_dir, target_dir, dirs_exist_ok=True)
        return target_dir

    @staticmethod
    def safe_extract_zip(zip_path: Path, extract_to: Path) -> Path:
        """Safely extracts zip file with Zip-Slip path traversal prevention."""
        extract_to.mkdir(parents=True, exist_ok=True)
        extract_to_resolved = extract_to.resolve()

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            for member in zip_ref.namelist():
                # Prevent path traversal
                dest_path = (extract_to / member).resolve()
                if not str(dest_path).startswith(str(extract_to_resolved)):
                    raise ValueError(f"ZipSlip security violation: path traversal detected in '{member}'")
            zip_ref.extractall(extract_to)

        return extract_to

    @staticmethod
    def apply_unified_diff(workspace_dir: Path, diff_text: str) -> bool:
        """Applies a unified diff to a file in the workspace."""
        import re
        lines = diff_text.strip().splitlines()
        target_file = None

        # Extract target filename from diff header (+++ b/filename.py or +++ filename.py)
        for line in lines:
            if line.startswith("+++ "):
                target_file = line[4:].strip()
                if target_file.startswith("b/"):
                    target_file = target_file[2:]
                break

        if not target_file:
            return False

        file_path = workspace_dir / target_file
        if not file_path.exists():
            # If target file is nested or relative, check directly
            candidates = list(workspace_dir.rglob(target_file))
            if candidates:
                file_path = candidates[0]
            else:
                return False

        try:
            original_content = file_path.read_text(encoding="utf-8")
        except Exception:
            return False

        # Apply simple hunk replacements or safe rewriting
        # For our synthesized patches, we can parse standard hunks or direct replacement
        added_lines = []
        deleted_lines = []
        for line in lines:
            if line.startswith("+") and not line.startswith("+++"):
                added_lines.append(line[1:])
            elif line.startswith("-") and not line.startswith("---"):
                deleted_lines.append(line[1:])

        # Apply modifications: if specific deleted lines exist, replace them with added lines
        new_content = original_content
        if deleted_lines:
            del_block = "\n".join(deleted_lines)
            add_block = "\n".join(added_lines)
            if del_block in new_content:
                new_content = new_content.replace(del_block, add_block, 1)
            else:
                # If exact multiline block not found, attempt line-by-line replacement
                for d in deleted_lines:
                    if d in new_content:
                        new_content = new_content.replace(d, "\n".join(added_lines), 1)
                        break
        elif added_lines:
            # Append if insertion point
            new_content = original_content + "\n" + "\n".join(added_lines)

        file_path.write_text(new_content, encoding="utf-8")
        return True
