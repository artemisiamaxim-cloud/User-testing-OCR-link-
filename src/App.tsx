import { useState } from "react";
import { ApplicationsListPage } from "./component/applications-list-page";
import { ApplicationPage } from "./component/application-page";
import { IndicativeOfferDocuments } from "./component/indicative-offer-documents";

type Page = "list" | "application" | "documents";

export default function App() {
  const [page, setPage] = useState<Page>("list");
  const [documentsKey, setDocumentsKey] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

  if (page === "list") {
    return (
      <ApplicationsListPage
        onSelectDeal={() => setPage("application")}
      />
    );
  }

  if (page === "application") {
    return (
      <ApplicationPage
        onUpload={() => setPage("documents")}
        onNavigateToApplications={() => setPage("list")}
        uploadedFilesCount={uploadedFilesCount}
      />
    );
  }

  return (
    <IndicativeOfferDocuments
      key={documentsKey}
      onNavigateToCompany={() => setPage("application")}
      onNavigateToApplications={() => setPage("list")}
      onSimulateRefresh={() => { setDocumentsKey(k => k + 1); setUploadedFilesCount(0); }}
      onConfirm={(count) => { setUploadedFilesCount(count); setPage("application"); }}
    />
  );
}
