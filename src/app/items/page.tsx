import { Suspense } from "react";
import ItemsClient from "./ui";

export default function ItemsPage() {
  return (
    <Suspense>
      <ItemsClient />
    </Suspense>
  );
}

