"use client";

import React from "react";
import "../globals.css";


export default function LineLayout({ children }) {
  return (
    <div className="flex justify-center p-0 m-0 box-border">
      <header></header>

      <main className="">
        {children}
      </main>

      <footer></footer>
    </div>
  );
}
