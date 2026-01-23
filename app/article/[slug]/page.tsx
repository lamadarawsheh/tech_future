'use client';

import { useParams } from "next/navigation";
import { Article } from "../../../src/legacy-pages/Article";

export default function Page() {
    const params = useParams();
    // We don't actually need to pass params to Article because Article uses useParams internally,
    // but Article needs to be updated to use Next.js's useParams.
    return <Article />;
}
