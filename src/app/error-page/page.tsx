
import { Suspense } from "react";
import ErrorPageContent from "./error-page-content";

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <main
          className="grid min-h-screen place-items-center bg-[#f5f8fc]"
          dir="rtl"
        >
          <p className="text-[#536a88]">
            در حال بارگذاری...
          </p>
        </main>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
