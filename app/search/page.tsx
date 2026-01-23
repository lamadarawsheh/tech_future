'use client';

import { Suspense } from "react";
import { Search } from "../../src/legacy-pages/Search";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading search...</div>}>
            <Search />
        </Suspense>
    );
}
