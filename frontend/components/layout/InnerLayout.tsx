"use client";

import { ReactNode } from "react";

interface InnerLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  actionsAlign?: "left" | "right";
}

export default function InnerLayout({ children, title, subtitle, actions, actionsAlign = "left" }: InnerLayoutProps) {
  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-[#3A2E22] mb-1">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[#A6987F]">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className={`mb-6 ${actionsAlign === "right" ? "flex justify-end" : ""}`}>{actions}</div>
      )}

      {/* Page Body */}
      {children}
    </>
  );
}
