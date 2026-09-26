import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/Button";

describe("test environment", () => {
  it("renders a UI component in jsdom", () => {
    render(<Button>Save record</Button>);
    expect(screen.getByRole("button", { name: "Save record" })).toBeInTheDocument();
  });
});
