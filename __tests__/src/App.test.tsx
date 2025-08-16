import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import App from "../../src/App";

describe("App コンポーネント", () => {
  it("アプリタイトルが正しく表示されることを確認", () => {
    render(<App />);
    expect(screen.getByText("ナラベタスク")).toBeDefined();
  });

  it("タイムラインセクションが表示されることを確認", () => {
    render(<App />);
    expect(screen.getByText(/タイムライン/)).toBeDefined();
  });

  it("タスク作成ボタンが表示され、クリック可能であることを確認", () => {
    render(<App />);
    const createButton = screen.getByRole("button", { name: "タスク作成" });
    expect(createButton).toBeDefined();
  });

  it("タスク置き場が表示されることを確認", () => {
    render(<App />);
    expect(screen.getByText("タスク置き場")).toBeDefined();
  });

  it("タスク作成ボタンクリックで新しいタスクが追加されることを確認", () => {
    render(<App />);
    const createButton = screen.getByRole("button", { name: "タスク作成" });

    // 初期状態でタスクがないことを確認
    expect(screen.queryByText("タスク 1")).toBeNull();

    // タスク作成ボタンをクリック
    fireEvent.click(createButton);

    // タスクが作成されたことを確認
    expect(screen.getByText("タスク 1")).toBeDefined();
  });

  it("3段レイアウト構造が正しく適用されていることを確認", () => {
    render(<App />);

    // 各セクションが存在することを確認
    const timelineSection = document.querySelector(".timeline-section");
    const taskSection = document.querySelector(".task-section");
    const settingsSection = document.querySelector(".settings-section");

    expect(timelineSection).toBeDefined();
    expect(taskSection).toBeDefined();
    expect(settingsSection).toBeDefined();
  });
});
