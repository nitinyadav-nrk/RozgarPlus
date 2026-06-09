import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router } from "wouter";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  useAuth: () => ({ user: null, isLoading: false, login: () => {}, logout: () => {} }),
}));

vi.mock("@/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api-client")>();
  return {
    ...actual,
    useListJobs: () => ({
      data: {
        jobs: [
          {
            id: "1",
            title: "Frontend Developer",
            company: "Acme Corp",
            location: "Remote",
            salary: "₹45,000",
            type: "Full-time",
          },
        ],
      },
    }),
    getListJobsQueryKey: () => ["listJobs"],
  };
});

import Home from "@/pages/public/Home";

const createTestQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe("Home page UI", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders hero content and CTA buttons", () => {
    render(
      <Router>
        <QueryClientProvider client={createTestQueryClient()}>
        <Home />
        </QueryClientProvider>
      </Router>,
    );

    expect(screen.getByRole("heading", { name: /Land Your Dream Job as a/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Browse Jobs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Free Profile/i })).toBeInTheDocument();
    expect(screen.getByText(/India's Fastest Growing Job Platform/i)).toBeInTheDocument();
  });

  it("renders category cards and featured category links", () => {
    render(
      <Router>
        <QueryClientProvider client={createTestQueryClient()}>
        <Home />
        </QueryClientProvider>
      </Router>,
    );

    expect(screen.getByText(/Engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/Design/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketing/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Science/i)).toBeInTheDocument();
  });

  it("animates the hero title over time", async () => {
    render(
      <Router>
        <QueryClientProvider client={createTestQueryClient()}>
        <Home />
        </QueryClientProvider>
      </Router>,
    );

    const initialTitle = screen
      .getAllByText(/Frontend Developer|Data Scientist|Product Designer|Marketing Lead|Backend Engineer|DevOps Engineer/i)
      .find((node) => node.tagName === "SPAN");
    expect(initialTitle).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2600);
    });

    const nextTitle = screen
      .getAllByText(/Frontend Developer|Data Scientist|Product Designer|Marketing Lead|Backend Engineer|DevOps Engineer/i)
      .find((node) => node.tagName === "SPAN");
    expect(nextTitle).toBeInTheDocument();
  });
});
