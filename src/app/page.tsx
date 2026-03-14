"use client";

import ImageSlide from "@/components/home/ImageSlide";
import Status from "@/components/home/Status";
import ProductR from "@/components/home/ProductR";

export default function page() {
  return (
    <main className="min-h-screen">
      <ImageSlide />
      <Status />
      <ProductR />
    </main>
  );
}
