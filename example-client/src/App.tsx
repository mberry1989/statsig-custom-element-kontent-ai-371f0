import { useState } from "react";
import { LinkedItemExample } from "./LinkedItemExample.tsx";
import { RichTextExample } from "./RichTextExample.tsx";
import { useArticlePage, useLandingPage } from "./useKontentData.ts";
import { getUserId } from "./userId.ts";

type Tab = "component" | "linked-item";

const tabButtonStyle = (isActive: boolean): React.CSSProperties => ({
  padding: "0.5rem 1rem",
  border: "1px solid #ccc",
  borderBottom: isActive ? "1px solid white" : "1px solid #ccc",
  borderRadius: "4px 4px 0 0",
  background: isActive ? "white" : "#f5f5f5",
  cursor: "pointer",
  marginRight: "0.25rem",
  fontWeight: isActive ? "bold" : "normal",
  position: "relative",
  bottom: "-1px",
});

export const App = () => {
  const [activeTab, setActiveTab] = useState<Tab>("linked-item");

  const landingPage = useLandingPage("homepage");
  const articlePage = useArticlePage("sample_article");

  const isLoading = landingPage.isPending || articlePage.isPending;
  const hasError = landingPage.isError || articlePage.isError;

  return (
    <div>
      <h1>Statsig Experiment Resolution Example</h1>
      <p>
        <strong>User ID:</strong> <code>{getUserId()}</code>
      </p>
      <p style={{ color: "#666", fontSize: "0.9rem" }}>
        This example demonstrates two patterns for using experiments in Kontent.ai.
      </p>

      {isLoading ? (
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading content from Kontent.ai...
        </div>
      ) : null}

      {hasError ? (
        <div
          style={{
            padding: "1rem",
            background: "#fee",
            border: "1px solid #c00",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          <strong>Error loading content:</strong>
          <br />
          {landingPage.error?.message ?? articlePage.error?.message}
          <br />
          <small style={{ color: "#666" }}>
            Make sure you have imported content using <code>pnpm import:all</code> and published it
            in Kontent.ai.
          </small>
        </div>
      ) : null}

      {!(isLoading || hasError) && (
        <>
          <div style={{ marginTop: "1rem" }}>
            <button
              type="button"
              style={tabButtonStyle(activeTab === "component")}
              onClick={() => setActiveTab("component")}
            >
              Component in Rich Text
            </button>
            <button
              type="button"
              style={tabButtonStyle(activeTab === "linked-item")}
              onClick={() => setActiveTab("linked-item")}
            >
              Linked Items
            </button>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "0 4px 4px 4px",
            }}
          >
            {activeTab === "component" ? (
              <RichTextExample articlePage={articlePage.data} />
            ) : (
              <LinkedItemExample landingPage={landingPage.data} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
