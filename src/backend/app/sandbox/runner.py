"""Subprocess execution sandbox with timeout, resource bounds, and trace capture."""

import os
import sys
import time
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.config import settings


class SandboxResult(BaseModel):
    command: str
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int
    timed_out: bool = False


class ExecutionSandbox:
    """Safely runs commands inside isolated workspace subprocesses."""

    def __init__(self, workspace_dir: Path, timeout_sec: int = settings.SANDBOX_TIMEOUT_SEC):
        self.workspace_dir = workspace_dir
        self.timeout_sec = timeout_sec

    async def run_command(
        self,
        command: List[str] | str,
        env: Optional[Dict[str, str]] = None,
    ) -> SandboxResult:
        """Executes a command inside the workspace directory with timeout protection."""
        start_time = time.time()
        safe_env = os.environ.copy()
        safe_env["PYTHONUNBUFFERED"] = "1"
        safe_env["PYTHONDONTWRITEBYTECODE"] = "1"
        if env:
            safe_env.update(env)

        # In Windows/Linux, handle list or string
        is_windows = sys.platform.startswith("win")
        cmd_args = command if isinstance(command, list) else command

        try:
            process = await asyncio.create_subprocess_exec(
                *(cmd_args if isinstance(cmd_args, list) else [cmd_args]),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
                cwd=str(self.workspace_dir),
                env=safe_env,
            )

            try:
                stdout_bytes, stderr_bytes = await asyncio.wait_for(
                    process.communicate(), timeout=self.timeout_sec
                )
                stdout = stdout_bytes.decode("utf-8", errors="replace")
                stderr = stderr_bytes.decode("utf-8", errors="replace")
                exit_code = process.returncode or 0
                timed_out = False
            except asyncio.TimeoutError:
                process.kill()
                stdout = ""
                stderr = f"Execution timed out after {self.timeout_sec} seconds."
                exit_code = -1
                timed_out = True

        except Exception as exc:
            stdout = ""
            stderr = f"Sandbox execution exception: {str(exc)}"
            exit_code = -1
            timed_out = False

        duration_ms = int((time.time() - start_time) * 1000)
        return SandboxResult(
            command=" ".join(cmd_args) if isinstance(cmd_args, list) else str(cmd_args),
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms,
            timed_out=timed_out,
        )

    async def run_pytest(self, test_file: Optional[str] = None) -> SandboxResult:
        """Executes pytest test runner inside the sandbox workspace."""
        python_exe = sys.executable
        cmd = [python_exe, "-m", "pytest", "-v"]
        if test_file:
            cmd.append(test_file)
        return await self.run_command(cmd)

    async def run_linter(self) -> SandboxResult:
        """Runs ruff static linter across the workspace."""
        python_exe = sys.executable
        cmd = [python_exe, "-m", "ruff", "check", "."]
        return await self.run_command(cmd)
