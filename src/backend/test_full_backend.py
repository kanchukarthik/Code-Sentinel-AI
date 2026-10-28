import sys
import json
import time
import zipfile
import io
import asyncio
import httpx
import websockets

BASE = "http://127.0.0.1:8000"

async def main():
    async with httpx.AsyncClient(base_url=BASE, timeout=30.0) as client:
        results = []

        def log_res(method, url, req_desc, status, resp_summary, passed):
            results.append({
                "method": method,
                "url": url,
                "request": req_desc,
                "status": status,
                "summary": resp_summary[:80],
                "pass": "PASS" if passed else "FAIL"
            })

        print("=== 1. Testing Health Endpoints ===")
        # /health
        r = await client.get("/health")
        log_res("GET", "/health", "Health check", r.status_code, r.text, r.status_code == 200)

        # /api/v1/health
        r = await client.get("/api/v1/health")
        log_res("GET", "/api/v1/health", "v1 Health check", r.status_code, r.text, r.status_code == 200)

        print("=== 2. Testing Projects Endpoints ===")
        # GET /api/v1/projects
        r = await client.get("/api/v1/projects")
        projects = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/projects", "List projects", r.status_code, f"{len(projects)} projects found", r.status_code == 200)

        # POST /api/v1/projects (missing name -> expect 422)
        r = await client.post("/api/v1/projects", data={})
        log_res("POST", "/api/v1/projects", "Missing name field", r.status_code, r.text, r.status_code == 422)

        # POST /api/v1/projects (valid creation)
        r = await client.post("/api/v1/projects", data={"name": "Test Project Alpha", "description": "Auto created"})
        created_p = r.json() if r.status_code == 201 else None
        created_id = created_p["id"] if created_p else "unknown"
        log_res("POST", "/api/v1/projects", "Create project valid", r.status_code, f"ID: {created_id}", r.status_code == 201)

        # GET /api/v1/projects/{created_id}
        r = await client.get(f"/api/v1/projects/{created_id}")
        log_res("GET", f"/api/v1/projects/{created_id}", "Get project valid ID", r.status_code, r.text, r.status_code == 200)

        # GET /api/v1/projects/nonexistent-999
        r = await client.get("/api/v1/projects/nonexistent-999")
        log_res("GET", "/api/v1/projects/nonexistent-999", "Get project invalid ID", r.status_code, r.text, r.status_code == 404)

        # Check POST /api/v1/projects/upload (frontend tries calling this!)
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
            zf.writestr("calc.py", "def add(a, b): return a + b\n")
        zip_bytes = zip_buffer.getvalue()

        r = await client.post("/api/v1/projects/upload", data={"name": "ZipProject"}, files={"file": ("test.zip", zip_bytes, "application/zip")})
        log_res("POST", "/api/v1/projects/upload", "Upload zip to /projects/upload", r.status_code, r.text, r.status_code in [200, 201])

        # Test upload zip via POST /api/v1/projects
        r = await client.post("/api/v1/projects", data={"name": "ZipProjectReal", "description": "Uploaded zip"}, files={"file": ("test.zip", zip_bytes, "application/zip")})
        log_res("POST", "/api/v1/projects", "Upload zip via POST /projects", r.status_code, r.text, r.status_code == 201)
        zip_proj_id = r.json()["id"] if r.status_code == 201 else None

        # DELETE /api/v1/projects/nonexistent-999
        r = await client.delete("/api/v1/projects/nonexistent-999")
        log_res("DELETE", "/api/v1/projects/nonexistent-999", "Delete invalid ID", r.status_code, r.text, r.status_code == 404)

        # DELETE /api/v1/projects/{created_id}
        r = await client.delete(f"/api/v1/projects/{created_id}")
        log_res("DELETE", f"/api/v1/projects/{created_id}", "Delete valid ID", r.status_code, "Deleted", r.status_code == 204)

        print("=== 3. Testing Runs Endpoints ===")
        # Find calc project
        calc_p = next((p for p in projects if "Calculator" in p["name"]), projects[0] if projects else None)
        target_pid = calc_p["id"] if calc_p else zip_proj_id

        # POST /api/v1/projects/nonexistent/runs
        r = await client.post("/api/v1/projects/nonexistent/runs", json={})
        log_res("POST", "/api/v1/projects/nonexistent/runs", "Trigger run invalid project", r.status_code, r.text, r.status_code == 404)

        # POST /api/v1/projects/{target_pid}/runs
        r = await client.post(f"/api/v1/projects/{target_pid}/runs", json={"trigger": "test", "branch": "main", "max_repair_iterations": 2, "timeout_sec": 10, "llm_provider": "mock"})
        new_run = r.json() if r.status_code == 202 else None
        new_run_id = new_run["id"] if new_run else "unknown"
        log_res("POST", f"/api/v1/projects/{target_pid}/runs", "Trigger run valid", r.status_code, f"Run ID: {new_run_id}", r.status_code == 202)

        # GET /api/v1/runs
        r = await client.get("/api/v1/runs")
        all_runs = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/runs", "List all runs", r.status_code, f"{len(all_runs)} runs found", r.status_code == 200)

        # GET /api/v1/runs?project_id={target_pid}
        r = await client.get(f"/api/v1/runs?project_id={target_pid}")
        log_res("GET", f"/api/v1/runs?project_id=...", "Filter runs by project", r.status_code, f"{len(r.json() if r.status_code == 200 else [])} runs", r.status_code == 200)

        # GET /api/v1/runs/nonexistent-run
        r = await client.get("/api/v1/runs/nonexistent-run")
        log_res("GET", "/api/v1/runs/nonexistent-run", "Get run invalid ID", r.status_code, r.text, r.status_code == 404)

        # GET /api/v1/runs/{new_run_id}
        r = await client.get(f"/api/v1/runs/{new_run_id}")
        log_res("GET", f"/api/v1/runs/{new_run_id}", "Get run valid ID", r.status_code, f"Status: {r.json().get('status') if r.status_code == 200 else 'err'}", r.status_code == 200)

        # POST /api/v1/runs/nonexistent-run/cancel
        r = await client.post("/api/v1/runs/nonexistent-run/cancel")
        log_res("POST", "/api/v1/runs/nonexistent-run/cancel", "Cancel invalid run ID", r.status_code, r.text, r.status_code == 404)

        # Wait for run to complete
        print(f"Waiting for run {new_run_id} to complete in background...")
        for _ in range(20):
            await asyncio.sleep(1)
            r = await client.get(f"/api/v1/runs/{new_run_id}")
            if r.status_code == 200 and r.json().get("status") in ["passed", "failed"]:
                break
        print(f"Run {new_run_id} final status: {r.json().get('status')}")

        # GET /api/v1/runs/{new_run_id}/agents
        r = await client.get(f"/api/v1/runs/{new_run_id}/agents")
        agents = r.json() if r.status_code == 200 else []
        log_res("GET", f"/api/v1/runs/{new_run_id}/agents", "Get run agents", r.status_code, f"{len(agents)} agent tasks", r.status_code == 200 and len(agents) == 7)

        # GET /api/v1/runs/{new_run_id}/logs
        r = await client.get(f"/api/v1/runs/{new_run_id}/logs")
        logs = r.json() if r.status_code == 200 else []
        log_res("GET", f"/api/v1/runs/{new_run_id}/logs", "Get run logs", r.status_code, f"{len(logs)} log entries", r.status_code == 200)

        # GET /api/v1/runs/{new_run_id}/logs?level=ERROR
        r = await client.get(f"/api/v1/runs/{new_run_id}/logs?level=ERROR")
        log_res("GET", f"/api/v1/runs/{new_run_id}/logs?level=ERROR", "Filter logs by level", r.status_code, f"{len(r.json() if r.status_code == 200 else [])} error logs", r.status_code == 200)

        print("=== 4. Testing Tests Endpoints ===")
        # Seeded run-hist-103 has tests
        r = await client.get("/api/v1/runs/run-hist-103/tests")
        tests = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/runs/run-hist-103/tests", "Get run tests", r.status_code, f"{len(tests)} tests", r.status_code == 200 and len(tests) > 0)

        # Filter by category
        r = await client.get("/api/v1/runs/run-hist-103/tests?category=boundary")
        log_res("GET", "/api/v1/runs/.../tests?category=boundary", "Filter tests by category", r.status_code, f"{len(r.json() if r.status_code == 200 else [])} tests", r.status_code == 200)

        # GET test-results
        r = await client.get("/api/v1/runs/run-hist-103/test-results")
        log_res("GET", "/api/v1/runs/run-hist-103/test-results", "Get test results", r.status_code, f"{len(r.json() if r.status_code == 200 else [])} results", r.status_code == 200)

        print("=== 5. Testing Bugs & Root-Causes Endpoints ===")
        # GET bugs
        r = await client.get("/api/v1/runs/run-hist-103/bugs")
        bugs = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/runs/run-hist-103/bugs", "Get run bugs", r.status_code, f"{len(bugs)} bugs", r.status_code == 200 and len(bugs) > 0)

        valid_bug_id = bugs[0]["id"] if bugs else "bug-seeded-401"
        # GET bug detail
        r = await client.get(f"/api/v1/bugs/{valid_bug_id}")
        log_res("GET", f"/api/v1/bugs/{valid_bug_id}", "Get bug detail valid", r.status_code, r.text[:80], r.status_code == 200)

        # GET bug detail invalid
        r = await client.get("/api/v1/bugs/nonexistent-bug-999")
        log_res("GET", "/api/v1/bugs/nonexistent-bug-999", "Get bug detail invalid", r.status_code, r.text, r.status_code == 404)

        # GET root causes
        r = await client.get("/api/v1/runs/run-hist-103/root-causes")
        rcs = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/runs/run-hist-103/root-causes", "Get root causes", r.status_code, f"{len(rcs)} SBFL results", r.status_code == 200 and len(rcs) > 0)

        print("=== 6. Testing Patches Endpoints & Lifecycle ===")
        # GET patches
        r = await client.get("/api/v1/runs/run-hist-103/patches")
        patches = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/runs/run-hist-103/patches", "Get run patches", r.status_code, f"{len(patches)} patches", r.status_code == 200 and len(patches) > 0)

        valid_patch_id = patches[0]["id"] if patches else "patch-seeded-801"

        # POST /patches/{patch_id}/approve (missing json body)
        r = await client.post(f"/api/v1/patches/{valid_patch_id}/approve")
        log_res("POST", f"/api/v1/patches/.../approve", "Approve patch without body", r.status_code, r.text, r.status_code == 422)

        # POST /patches/{patch_id}/approve (valid)
        r = await client.post(f"/api/v1/patches/{valid_patch_id}/approve", json={"notes": "Approved by automated test"})
        log_res("POST", f"/api/v1/patches/.../approve", "Approve patch valid", r.status_code, f"Status: {r.json().get('status') if r.status_code == 200 else 'err'}", r.status_code == 200 and r.json().get("status") == "approved")

        # POST /patches/nonexistent/approve
        r = await client.post("/api/v1/patches/nonexistent/approve", json={"notes": "test"})
        log_res("POST", "/api/v1/patches/nonexistent/approve", "Approve invalid patch", r.status_code, r.text, r.status_code == 404)

        # POST /patches/{patch_id}/reject (valid)
        r = await client.post(f"/api/v1/patches/{valid_patch_id}/reject", json={"notes": "Rejecting for re-synthesis"})
        log_res("POST", f"/api/v1/patches/.../reject", "Reject patch valid", r.status_code, f"Status: {r.json().get('status') if r.status_code == 200 else 'err'}", r.status_code == 200 and r.json().get("status") == "rejected")

        # POST /patches/nonexistent/reject
        r = await client.post("/api/v1/patches/nonexistent/reject", json={"notes": "test"})
        log_res("POST", "/api/v1/patches/nonexistent/reject", "Reject invalid patch", r.status_code, r.text, r.status_code == 404)

        # POST /patches/{patch_id}/rollback (valid)
        r = await client.post(f"/api/v1/patches/{valid_patch_id}/rollback", json={"rollback_reason": "Regression detected in prod"})
        log_res("POST", f"/api/v1/patches/.../rollback", "Rollback patch valid", r.status_code, f"Status: {r.json().get('status') if r.status_code == 200 else 'err'}", r.status_code == 200 and r.json().get("status") == "rolled_back")

        # POST /patches/nonexistent/rollback
        r = await client.post("/api/v1/patches/nonexistent/rollback", json={"rollback_reason": "test"})
        log_res("POST", "/api/v1/patches/nonexistent/rollback", "Rollback invalid patch", r.status_code, r.text, r.status_code == 404)

        # POST /patches/{patch_id}/revalidate (valid)
        r = await client.post(f"/api/v1/patches/{valid_patch_id}/revalidate")
        log_res("POST", f"/api/v1/patches/.../revalidate", "Revalidate patch valid", r.status_code, f"Verdict: {r.json().get('validation_result_json', {}).get('verdict') if r.status_code == 200 else 'err'}", r.status_code == 200)

        # POST /patches/nonexistent/revalidate
        r = await client.post("/api/v1/patches/nonexistent/revalidate")
        log_res("POST", "/api/v1/patches/nonexistent/revalidate", "Revalidate invalid patch", r.status_code, r.text, r.status_code == 404)

        print("=== 7. Testing Metrics & Feedback Endpoints ===")
        # GET coverage
        r = await client.get("/api/v1/runs/run-hist-103/coverage")
        log_res("GET", "/api/v1/runs/run-hist-103/coverage", "Get run coverage", r.status_code, f"Cov: {r.json().get('statement_coverage_pct') if r.status_code == 200 else 'err'}", r.status_code == 200)

        # GET run metrics
        r = await client.get("/api/v1/runs/run-hist-103/metrics")
        log_res("GET", "/api/v1/runs/run-hist-103/metrics", "Get run metrics", r.status_code, f"PSR: {r.json().get('patch_success_rate') if r.status_code == 200 else 'err'}", r.status_code == 200)

        # GET metrics invalid
        r = await client.get("/api/v1/runs/nonexistent/metrics")
        log_res("GET", "/api/v1/runs/nonexistent/metrics", "Get metrics invalid run", r.status_code, r.text, r.status_code == 404)

        # GET metrics summary
        r = await client.get("/api/v1/metrics/summary")
        log_res("GET", "/api/v1/metrics/summary", "Get metrics summary", r.status_code, f"Total runs: {r.json().get('total_runs') if r.status_code == 200 else 'err'}", r.status_code == 200)

        # GET feedback
        r = await client.get("/api/v1/feedback")
        fb = r.json() if r.status_code == 200 else []
        log_res("GET", "/api/v1/feedback", "Get feedback records", r.status_code, f"{len(fb)} records", r.status_code == 200)

        print("=== 8. Testing Settings Endpoints & Persistence ===")
        # GET settings
        r = await client.get("/api/v1/settings")
        init_settings = r.json() if r.status_code == 200 else {}
        log_res("GET", "/api/v1/settings", "Get settings", r.status_code, f"Provider: {init_settings.get('llm_provider')}", r.status_code == 200)

        # PUT settings (update confidence & auto_heal_policy)
        update_payload = {
            "auto_heal_policy": "auto_approve_high_confidence",
            "confidence_threshold": 0.92,
            "max_repair_iterations": 4,
            "sandbox_timeout_sec": 45,
            "api_keys": {"gemini": "test-key-123456"}
        }
        r = await client.put("/api/v1/settings", json=update_payload)
        updated_s = r.json() if r.status_code == 200 else {}
        log_res("PUT", "/api/v1/settings", "Update settings valid", r.status_code, f"Policy: {updated_s.get('auto_heal_policy')}", r.status_code == 200 and updated_s.get("auto_heal_policy") == "auto_approve_high_confidence")

        # GET settings again to confirm persistence!
        r = await client.get("/api/v1/settings")
        persisted_s = r.json() if r.status_code == 200 else {}
        is_persisted = (persisted_s.get("auto_heal_policy") == "auto_approve_high_confidence" and persisted_s.get("confidence_threshold") == 0.92 and persisted_s.get("sandbox_timeout_sec") == 45)
        log_res("GET", "/api/v1/settings", "Confirm settings persisted", r.status_code, f"Persisted: {is_persisted}", r.status_code == 200 and is_persisted)

        # PUT settings invalid (e.g. wrong type for confidence_threshold)
        r = await client.put("/api/v1/settings", json={"confidence_threshold": "not_a_float"})
        log_res("PUT", "/api/v1/settings", "Update settings invalid type", r.status_code, r.text, r.status_code == 422)

        print("=== 9. Testing CORS Headers ===")
        # Test OPTIONS preflight request for http://localhost:5173
        r = await client.options("/api/v1/projects", headers={"Origin": "http://localhost:5173", "Access-Control-Request-Method": "POST"})
        cors_ok = r.headers.get("access-control-allow-origin") in ["*", "http://localhost:5173"]
        log_res("OPTIONS", "/api/v1/projects", "CORS Preflight from :5173", r.status_code, f"ACAO: {r.headers.get('access-control-allow-origin')}", cors_ok)

        # Test GET with Origin header
        r = await client.get("/api/v1/projects", headers={"Origin": "http://localhost:5173"})
        cors_get_ok = r.headers.get("access-control-allow-origin") in ["*", "http://localhost:5173"]
        log_res("GET", "/api/v1/projects", "CORS Request from :5173", r.status_code, f"ACAO: {r.headers.get('access-control-allow-origin')}", cors_get_ok)

        print("\n" + "="*80)
        print(f"{'Method':<7} | {'URL':<38} | {'Request':<30} | {'Status':<6} | {'PASS/FAIL':<9} | {'Summary'}")
        print("="*80)
        for res in results:
            print(f"{res['method']:<7} | {res['url']:<38} | {res['request']:<30} | {res['status']:<6} | {res['pass']:<9} | {res['summary']}")

if __name__ == "__main__":
    asyncio.run(main())
