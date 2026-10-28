"""Integration tests for all REST API endpoints."""

import pytest


def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "code_intelligence" in data["agents"]
    assert len(data["agents"]) == 7


def test_list_projects(client):
    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [p["name"] for p in data]
    assert any("Calculator" in n or "Shopping" in n for n in names)


def test_list_runs(client):
    response = client.get("/api/v1/runs")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    run_ids = [r["id"] for r in data]
    assert "run-hist-101" in run_ids


def test_get_run_detail(client):
    response = client.get("/api/v1/runs/run-hist-101")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "run-hist-101"
    assert data["status"] in ["passed", "completed"]


def test_get_run_agent_tasks(client):
    response = client.get("/api/v1/runs/run-hist-101/agents")
    assert response.status_code == 200
    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) == 7
    agent_names = [t["agent_name"] for t in tasks]
    assert any("Code Intelligence" in name for name in agent_names)
    assert any("Self-Healing" in name for name in agent_names)


def test_get_tests(client):
    response = client.get("/api/v1/runs/run-hist-103/tests")
    assert response.status_code == 200
    tests = response.json()
    assert isinstance(tests, list)
    assert len(tests) >= 3


def test_get_bugs(client):
    response = client.get("/api/v1/runs/run-hist-103/bugs")
    assert response.status_code == 200
    bugs = response.json()
    assert isinstance(bugs, list)
    assert len(bugs) >= 1
    first_bug = bugs[0]
    assert "category" in first_bug
    assert "severity" in first_bug


def test_get_root_causes(client):
    response = client.get("/api/v1/runs/run-hist-103/root-causes")
    assert response.status_code == 200
    rc = response.json()
    assert isinstance(rc, list)
    assert len(rc) >= 1
    assert rc[0]["rankings_json"][0]["score"] >= 0.0


def test_get_patches(client):
    response = client.get("/api/v1/runs/run-hist-103/patches")
    assert response.status_code == 200
    patches = response.json()
    assert isinstance(patches, list)
    assert len(patches) >= 1
    assert "diff_content" in patches[0]


def test_get_metrics(client):
    response = client.get("/api/v1/runs/run-hist-103/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "patch_success_rate" in metrics
    assert "fault_localization_top1_acc" in metrics


def test_metrics_summary(client):
    response = client.get("/api/v1/metrics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_runs" in data
    assert data["total_runs"] >= 1


def test_settings_get_and_update(client):
    response = client.get("/api/v1/settings")
    assert response.status_code == 200
    curr = response.json()
    assert "llm_provider" in curr

    # Update settings
    update_res = client.put("/api/v1/settings", json={
        "auto_heal_policy": "automatic",
        "confidence_threshold": 0.90,
    })
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["auto_heal_policy"] == "automatic"
    assert updated["confidence_threshold"] == 0.90
