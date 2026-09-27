from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


TEST_TEXT = """
During manufacturing of API Product A at the Bangalore API Manufacturing Site
on 2026-09-26, the granulation temperature exceeded the approved process
parameter range for approximately 8 minutes in batch BATCH-2026-001.
The event was identified during routine manufacturing monitoring.
No confirmed product quality impact has been established.
The deviation was reported by Manufacturing.
"""


def test_ai_process_endpoint_returns_complete_response():
    response = client.post(
        "/api/v1/ai/process",
        data={"text": TEST_TEXT},
    )

    assert response.status_code == 200

    body = response.json()

    assert body["source_type"] == "text"
    assert body["processing_summary"]

    assert body["extracted"]["site"] == "Bangalore API Manufacturing Site"
    assert body["extracted"]["batch_number"] == "BATCH-2026-001"
    assert body["extracted"]["source"] == "Manufacturing"

    assert body["impact"]["level"] in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }
    assert body["impact"]["reason"]

    assert body["severity"]["level"] in {
        "LOW",
        "MEDIUM",
        "HIGH",
        "CRITICAL",
    }
    assert body["severity"]["reason"]

    assert body["knowledge_matches"]
    assert len(body["knowledge_matches"]) <= 5

    assert any(
        match["authority"] == "FDA"
        and match["is_synthetic"] is False
        and match["source_url"]
        for match in body["knowledge_matches"]
    )

    assert any(
        match["is_synthetic"] is True
        for match in body["knowledge_matches"]
    )
