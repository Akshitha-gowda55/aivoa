from app.ai.retrieval import retrieve_knowledge


TEST_DESCRIPTION = """
During manufacturing of API Product A at the Bangalore API Manufacturing Site
on 2026-09-26, the granulation temperature exceeded the approved process
parameter range for approximately 8 minutes in batch BATCH-2026-001.
The event was identified during routine manufacturing monitoring.
No confirmed product quality impact has been established.
"""


def test_retrieval_returns_relevant_temperature_pattern():
    matches = retrieve_knowledge(
        site="Bangalore API Manufacturing Site",
        title="Granulation temperature exceeded approved range for approx 8 minutes",
        source="Manufacturing",
        product="API Product A",
        batch_number="BATCH-2026-001",
        description=TEST_DESCRIPTION,
        limit=5,
    )

    assert matches
    assert len(matches) <= 5
    assert matches[0]["id"] == "kb-006"
    assert matches[0]["is_synthetic"] is True
    assert "temperature" in matches[0]["title"].lower()


def test_retrieval_includes_regulatory_context():
    matches = retrieve_knowledge(
        site="Bangalore API Manufacturing Site",
        title="Granulation temperature exceeded approved range",
        source="Manufacturing",
        product="API Product A",
        batch_number="BATCH-2026-001",
        description=TEST_DESCRIPTION,
        limit=5,
    )

    ids = {match["id"] for match in matches}

    assert "kb-005" in ids
    assert any(
        match["authority"] == "FDA" and not match["is_synthetic"]
        for match in matches
    )


def test_retrieval_does_not_prioritize_contradictory_quality_impact_pattern():
    matches = retrieve_knowledge(
        site="Bangalore API Manufacturing Site",
        title="Granulation temperature exceeded approved range",
        source="Manufacturing",
        product="API Product A",
        batch_number="BATCH-2026-001",
        description=TEST_DESCRIPTION,
        limit=5,
    )

    assert matches[0]["id"] != "kb-007"
