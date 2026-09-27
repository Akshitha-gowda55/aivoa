from datetime import date

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_create_and_update_deviation():
    payload = {
        "site": "Bangalore API Manufacturing Site",
        "date_of_occurrence": "2026-09-26",
        "title": "Automated test deviation",
        "source": "Manufacturing",
        "product": "API Product A",
        "batch_number": "TEST-BATCH-001",
        "description": "Automated test record for deviation CRUD verification.",
        "impact_level": "MEDIUM",
        "impact_reason": "Test impact reason.",
        "severity_level": "MEDIUM",
        "severity_reason": "Test severity reason.",
        "status": "DRAFT",
    }

    create_response = client.post(
        "/api/v1/deviations",
        json=payload,
    )

    assert create_response.status_code == 201

    created = create_response.json()

    assert created["deviation_number"].startswith("DEV-")
    assert created["title"] == "Automated test deviation"
    assert created["batch_number"] == "TEST-BATCH-001"
    assert created["impact_level"] == "MEDIUM"
    assert created["severity_level"] == "MEDIUM"
    assert created["status"] == "DRAFT"

    deviation_id = created["id"]

    update_response = client.patch(
        f"/api/v1/deviations/{deviation_id}",
        json={
            "title": "Automated test deviation - reviewed",
            "status": "SUBMITTED",
        },
    )

    assert update_response.status_code == 200

    updated = update_response.json()

    assert updated["id"] == deviation_id
    assert updated["title"] == "Automated test deviation - reviewed"
    assert updated["status"] == "SUBMITTED"

    get_response = client.get(
        f"/api/v1/deviations/{deviation_id}",
    )

    assert get_response.status_code == 200

    retrieved = get_response.json()

    assert retrieved["id"] == deviation_id
    assert retrieved["title"] == "Automated test deviation - reviewed"
    assert retrieved["batch_number"] == "TEST-BATCH-001"


def test_deviation_not_found():
    fake_id = "00000000-0000-0000-0000-000000000000"

    response = client.get(
        f"/api/v1/deviations/{fake_id}",
    )

    assert response.status_code == 404
