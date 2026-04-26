import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftBanner } from "./DraftBanner";

describe("DraftBanner", () => {
  it("renders the resume + discard actions and the prompt copy", () => {
    render(<DraftBanner onResume={() => {}} onDiscard={() => {}} />);
    expect(
      screen.getByText("드래프트가 저장되어 있습니다. 이어서 쓰시겠습니까?"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이어쓰기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "새로 시작" })).toBeInTheDocument();
  });

  it("calls onResume when 이어쓰기 is clicked", async () => {
    const onResume = vi.fn();
    render(<DraftBanner onResume={onResume} onDiscard={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "이어쓰기" }));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it("calls onDiscard when 새로 시작 is clicked", async () => {
    const onDiscard = vi.fn();
    render(<DraftBanner onResume={() => {}} onDiscard={onDiscard} />);
    await userEvent.click(screen.getByRole("button", { name: "새로 시작" }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});
